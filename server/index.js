const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const axios = require("axios"); // Для HTTP-запросов
const expandedChecklist = require("./checklist.json");
const {
  makePersonalChecklist,
  getMonthNumbersBetween,
  generatePdf,
  parseClimateData,
  buildPersonalChecklist,
} = require("./utils");
const app = express();
const port = 3001;

const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

app.use(cors({origin:"preview.appmaster.io"}));
app.use(express.json());
app.use(express.text({ type: "text/plain" }));

app.get("/api/checklist", (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required as a query parameter",
    });
  }

  const fileName = `${token}_checklist.json`;
  const filePath = path.join(__dirname, "checklists", fileName);

  // Проверяем, существует ли файл
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "Checklist file not found",
    });
  }

  try {
    // Читаем файл
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const checklist = JSON.parse(fileContent);

    res.status(200).json({
      success: true,
      checklist: checklist,
    });
  } catch (error) {
    console.error("Error reading checklist file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to read checklist file",
    });
  }
});

app.post("/api/generateToken", (req, res) => {
  try {
    const token = uuidv4();
    console.log("generatingToken");
    res.status(200).json({
      success: true,
      message: "Token generated successfully",
      token: token,
    });
  } catch (error) {
    const logMessage = `[${new Date().toISOString()}] FAILED makeChecklist: ${error.message}\n` +
                      `Request Body: ${JSON.stringify(req.body)}\n` +
                      `Stack: ${error.stack}\n\n`;

    console.log(logMessage);
    console.error("Error generating token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate token",
    });
  }
});

app.post("/api/makeChecklist", async (req, res) => {
  let token, place;

  try {
    // Определяем формат запроса
    if (req.is("text/plain")) {
      // Обработка plain text запроса
      const textData = req.body.trim();

      ({ token, place } = JSON.parse(textData));

      if (!token) {
        return res.status(400).json({
          success: false,
          message:
            "Token is required in text format. Format: '<token>|<place>'",
        });
      }

      // Устанавливаем место по умолчанию, если не указано
      place = place || "Москва";
      console.log(place);
    } else if (req.is("application/json")) {
      // Обработка JSON запроса
      ({ token, place } = req.body);

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required in JSON body",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Unsupported Content-Type. Please use text/plain or application/json",
      });
    }

    // Получаем координаты места
    const { data } = await axios.get(
      `https://geocode-maps.yandex.ru/v1/?apikey=${process.env.API_KEY}&geocode=${place}&format=json`
    );
    const firstResult = data.response.GeoObjectCollection.featureMember[0];
    const [lon, lat] = firstResult.GeoObject.Point.pos.split(" ");

    // Получаем данные о погоде

    // Пример использования:
    const monthsNumbers = getMonthNumbersBetween("2025-06-12", "2025-09-20");
    const weatherByMonths = await Promise.all(
      monthsNumbers.map(async (index) => {
        const { data: site } = await axios.get(
         `https://yandex.ru/pogoda/month/${months[index]}?lat=${lat}&lon=${lon}&lang=ru&via=cnav`
        );
        return {...parseClimateData(site),monthIndex:index};
      })
    );
    // Создаем папку для чеклистов, если её нет
    const checklistsDir = path.join(__dirname, "checklists");
    if (!fs.existsSync(checklistsDir)) {
      fs.mkdirSync(checklistsDir);
    }
    const mockData = {
      gender: "female",
      country: "Москва",
      startDate: "2025-06-12",
      endDate: "2025-09-20",
      hobby: "photography",
      vision: true,
      specialMeds: ["Ингалятор", "Противосудорожные препараты"],
    };

    const personalChecklist = buildPersonalChecklist(
      mockData,
      weatherByMonths.reduce((acc, curr, i) => {
        return {
          minTemp: Math.min(acc.minTemp, curr.minTemp),
          maxTemp: Math.max(acc.maxTemp, curr.maxTemp),
        };
      }),
      expandedChecklist
    );
    // Создаем файл чеклиста
    const fileName = `${token}_checklist.json`;
    const filePath = path.join(checklistsDir, fileName);
    const fileContent = JSON.stringify({checklist:personalChecklist,weather:weatherByMonths}, null, 2);

    fs.writeFileSync(filePath, fileContent);

    res.status(200).json({
      success: true,
      message: "Checklist file created successfully",
     weather:weatherByMonths
    });
  } catch (error) {
    const logMessage = `[${new Date().toISOString()}] FAILED makeChecklist: ${error.message}\n` +
                      `Request Body: ${JSON.stringify(req.body)}\n` +
                      `Stack: ${error.stack}\n\n`;

    console.log(logMessage);
    console.error("Error creating checklist file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create checklist file",
      error: error.message,
    });
  }
});

app.post("/api/generatePDF", (req, res) => {
  const { token } = req.body;
  const filePath = path.join(__dirname, "output.pdf");

  generatePdf(token)
    .then((pdfBuffer) => {
      fs.writeFile(filePath, pdfBuffer, (err) => {
        if (err) {
          console.error("Error saving PDF:", err);
          res.status(500).send("Error saving PDF");
        } else {
          res.download(filePath, (err) => {
            if (err) {
              console.error("Error sending PDF:", err);
              res.status(500).send("Error sending PDF");
            } else {
              // Удалите файл после отправки, чтобы не засорять сервер
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error("Error deleting PDF:", err);
                }
              });
            }
          });
        }
      });
    })
    .catch((err) => {
      console.error("Error generating PDF:", err);
      res.status(500).send("Error generating PDF");
    });
});
app.post("/api/updateChecklist", (req, res) => {
  const { token, checklist } = req.body;

  if (!token || !checklist) {
    return res.status(400).json({
      success: false,
      message: "Token and checklist are required",
    });
  }

  const fileName = `${token}_checklist.json`;
  const filePath = path.join(__dirname, "checklists", fileName);

  try {
    // Преобразуем обновленный чеклист в строку JSON
    const fileContent = JSON.stringify(checklist, null, 2);

    // Записываем обновленный чеклист в файл
    fs.writeFileSync(filePath, fileContent);

    res.status(200).json({
      success: true,
      message: "Checklist updated successfully",
    });
  } catch (error) {
    console.error("Error updating checklist file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update checklist file",
    });
  }
});
app.get("/checklist", (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required as a query parameter",
    });
  }

  const fileName = `${token}_checklist.json`;
  const filePath = path.join(__dirname, "checklists", fileName);

  // Проверяем, существует ли файл
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "Checklist file not found",
    });
  }
  app.use(express.static(path.join(__dirname, "dist")));
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.get("/healthcheck", (req, res) => {
    console.log("healthcheck");
    res.status(200).json({
      success: true,
    });
});
// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
