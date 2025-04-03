const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const axios = require("axios"); // Для HTTP-запросов
const cheerio = require("cheerio"); // Для парсинга HTML
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
// Пример данных для чеклиста
const expandedChecklist = {
  Гигиена: [
    { id: 15, name: "Бутылка для воды", completed: false, isDeleted: false },
    { id: 16, name: "Влажные салфетки", completed: false, isDeleted: false },
    { id: 17, name: "Бумажные платочки", completed: false, isDeleted: false },
    { id: 18, name: "Антисептик", completed: false, isDeleted: false },
    { id: 19, name: "Лейкопластырь", completed: false, isDeleted: false },
    { id: 20, name: "Бинт", completed: false, isDeleted: false },
    {
      id: 21,
      name: "Болеутоляющие средства",
      completed: false,
      isDeleted: false,
    },
    { id: 22, name: "Капли в нос", completed: false, isDeleted: false },
    {
      id: 23,
      name: "Таблетки для рассасывания от боли в горле",
      completed: false,
      isDeleted: false,
    },
    {
      id: 24,
      name: "Порошки от гриппа и простуды",
      completed: false,
      isDeleted: false,
    },
    {
      id: 25,
      name: "Средство от аллергии",
      completed: false,
      isDeleted: false,
    },
    { id: 26, name: "Перекись водорода", completed: false, isDeleted: false },
    { id: 27, name: "Смекта", completed: false, isDeleted: false },
    {
      id: 28,
      name: "Лекарства от специфических заболеваний",
      completed: false,
      isDeleted: false,
    },
    { id: 29, name: "Дезодорант", completed: false, isDeleted: false },
    {
      id: 30,
      name: "Гель для душа (мини-вариант)",
      completed: false,
      isDeleted: false,
    },
    {
      id: 31,
      name: "Шампунь (мини-вариант)",
      completed: false,
      isDeleted: false,
    },
    { id: 32, name: "Полотенце", completed: false, isDeleted: false },
    { id: 33, name: "Зубная паста", completed: false, isDeleted: false },
  ],
  Одежда: [
    {
      id: 43,
      name: "Нижнее бельё",
      count: 7,
      completed: false,
      isDeleted: false,
    },
    { id: 44, name: "Носки", count: 7, completed: false, isDeleted: false },
    {
      id: 45,
      name: "Рубашка / футболка",
      count: 5,
      completed: false,
      isDeleted: false,
    },
    {
      id: 46,
      name: "Брюки / джинсы",
      count: 2,
      completed: false,
      isDeleted: false,
    },
    { id: 47, name: "Пижама", count: 2, completed: false, isDeleted: false },
    { id: 48, name: "Сланцы", completed: false, isDeleted: false },
    { id: 49, name: "Ремень", completed: false, isDeleted: false },
    { id: 50, name: "Кроссовки", completed: false, isDeleted: false },
    {
      id: 51,
      name: "Комплект спортивной одежды",
      completed: false,
      isDeleted: false,
    },
    {
      id: 52,
      name: "Деловой комплект одежды",
      completed: false,
      isDeleted: false,
    },
    {
      id: 53,
      name: "Куртка на переходную погоду",
      completed: false,
      isDeleted: false,
    },
    { id: 54, name: "Ветровка", completed: false, isDeleted: false },
    { id: 55, name: "Обувь на дождь", completed: false, isDeleted: false },
  ],
  Документы: [
    { id: 1, name: "Загранпаспорт", completed: false, isDeleted: false },
    { id: 2, name: "Паспорт РФ", completed: false, isDeleted: false },
    { id: 3, name: "Страховка", completed: false, isDeleted: false },
    {
      id: 4,
      name: "Виза и другие документы",
      completed: false,
      isDeleted: false,
    },
    { id: 5, name: "Билеты на самолёт", completed: false, isDeleted: false },
    {
      id: 6,
      name: "Запись необходимых по приезде адресов",
      completed: false,
      isDeleted: false,
    },
    {
      id: 7,
      name: "Наличные / банковская карта",
      completed: false,
      isDeleted: false,
    },
  ],
  Техника: [
    { id: 10, name: "Ноутбук или планшет", completed: false, isDeleted: false },
    { id: 11, name: "Наушники", completed: false, isDeleted: false },
    {
      id: 12,
      name: "Зарядки для всех устройств",
      completed: false,
      isDeleted: false,
    },
    { id: 13, name: "Повербанк", completed: false, isDeleted: false },
    { id: 14, name: "Блокнот и ручка", completed: false, isDeleted: false },
  ],
  Прочее: [
    { id: 56, name: "Целлофановые пакеты", completed: false, isDeleted: false },
    {
      id: 57,
      name: "Настольная/карточная игра (Uno, Мафия)",
      completed: false,
      isDeleted: false,
    },
    { id: 58, name: "Постельное бельё", completed: false, isDeleted: false },
  ],
  Аксессуары: [
    { id: 8, name: "Рюкзак / сумка", completed: false, isDeleted: false },
    { id: 9, name: "Зонт / дождевик", completed: false, isDeleted: false },
  ],
  Удалённые: [],
};


async function generatePdf(token) {
  try {
    const fileName = `${token}_checklist.json`;
    const filePathChecklist = path.join(__dirname, "checklists", fileName);
    const filePathTemplate = path.join(__dirname, "template.html");
    const fileContentChecklist = fs.readFileSync(filePathChecklist, "utf-8");
    const fileContentTemplate = fs.readFileSync(filePathTemplate, "utf-8");
    const checklist = JSON.parse(fileContentChecklist);
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);

    const browser = await puppeteer.launch({ headless: true, args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',]});
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280, // Ширина в пикселях
      height: 720, // Высота в пикселях
    });
    const CategoryColors = [
      "rgb(184,253,97,0.15)",
      "rgba(253,184,97,0.15)",
      "rgba(97,184,253,0.15)",
      "rgba(253,97,184,0.15)",
      "rgba(97,253,184,0.15)",
      "rgba(184,97,253,0.15  )",
    ];
    let htmlContent = "";
    let i = 0;
    for (const category in checklist) {
      if (category == "Удалённые") continue;
      htmlContent += `
        <div class="categoryWrapper" style="background: ${
          CategoryColors[i % 6]
        }">
          <div class="title">${category}</div>
          <div class="itemsContainer">
      `;

      for (const item of checklist[category]) {
        htmlContent += `
            <div class="item">
              <input type="checkbox" class="checkbox" />
              <div class="name">${purify.sanitize(item.name)}</div>
              ${
                item.count !== undefined
                  ? `<span class="count">X ${purify.sanitize(item.count)}</span>`
                  : ""
              }
            </div>
        `;
      }
      htmlContent += "</div></div>";
      i++;
    }
    const filePDFContent = fileContentTemplate.replace(
      "<!--INSERT-->",
      htmlContent
    );
    await page.setContent(filePDFContent);
    fs.writeFile("output.html", filePDFContent, (err) => {
      if (err) {
        console.error("Error saving HTML:", err);
      } else {
        console.log("HTML saved successfully");
      }
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "10px",
        right: "10px",
        bottom: "10px",
        left: "10px",
      },
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
function parseClimateData(htmlString) {
  const $ = cheerio.load(htmlString);
  const result = {};

  // 1. Дни с разными погодными условиями
  result.weatherDays = [];
  $(".climate-month-additional-diagram__legend-item").each((i, el) => {
    const counter = parseInt(
      $(el)
        .find(".climate-month-additional-diagram__legend-counter")
        .text()
        .trim()
    );
    const text = $(el)
      .find(".climate-month-additional-diagram__legend-text")
      .text()
      .trim();
    result.weatherDays.push({ counter, text });
  });

  // 2. Влажность воздуха
  const humidityText = $(
    ".climate-month-additional-param:nth-child(1) .climate-month-additional-param__value"
  )
    .text()
    .trim();
  result.humidity = parseInt(humidityText);

  // 3. Ветер
  const windValueText = $(
    ".climate-month-additional-param:nth-child(2) .climate-month-additional-param__value"
  )
    .text()
    .trim();
  const windDir = $(".climate-month-additional-param:nth-child(2) .icon-abbr")
    .text()
    .trim();
  result.wind = {
    value: parseFloat(windValueText),
    direction: windDir,
  };

  // 4. Осадки
  const rainValueText = $(
    ".climate-month-additional-param:nth-child(3) .climate-month-additional-param__value"
  )
    .text()
    .trim();
  const rainDescription = $(
    ".climate-month-additional-param:nth-child(3) .climate-month-additional-param__description-name"
  )
    .text()
    .trim();
  result.rain = {
    value: parseInt(rainValueText),
    description: rainDescription,
  };

  //5 Месяц
  result.month = $(".climate-month-additional__title").text().trim();

  return result;
}

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
    res.status(200).json({
      success: true,
      message: "Token generated successfully",
      token: token,
    });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate token",
    });
  }
});

app.post("/api/makeChecklist", async (req, res) => {
  const { token, place } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required",
    });
  }

  try {
    const { data } = await axios.get(
      `https://geocode-maps.yandex.ru/v1/?apikey=${process.env.API_KEY}&geocode=${place}&format=json`
    );
    const firstResult = data.response.GeoObjectCollection.featureMember[0];
    const [lon, lat] = firstResult.GeoObject.Point.pos.split(" ");

    const { data: site } = await axios.get(
      `https://yandex.ru/pogoda/month/june?lat=${lat}&lon=${lon}&lang=ru&via=cnav`
    );
    const weather = parseClimateData(site);
    
    // Check if the checklists folder exists, and create it if it doesn't
    const checklistsDir = path.join(__dirname, "checklists");
    if (!fs.existsSync(checklistsDir)) {
      fs.mkdirSync(checklistsDir);
    }

    const fileName = `${token}_checklist.json`;
    const fileContent = JSON.stringify(expandedChecklist, null, 2);
    fs.writeFileSync(path.join(checklistsDir, fileName), fileContent);

    res.status(200).json({
      success: true,
      message: "Checklist file created successfully",
    });
  } catch (error) {
    console.error("Error creating checklist file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create checklist file",
      error: error.message, // Add error message for debugging
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
app.get("/checklist",(req,res)=>{
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
  app.use(express.static(path.join(__dirname, 'dist')));
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
