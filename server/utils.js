const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

function addItemToChecklist(category, name, checklist, count) {
  const newItem = {
    id: uuidv4(),
    name,
    completed: false,
    isDeleted: false,
  };

  if (count !== undefined) {
    newItem.count = count;
  }

  checklist[category].push(newItem);
}

function getMonthNumbersBetween(startDate, endDate) {
  console.log(endDate);
  const start = new Date(startDate);
  const end = new Date(endDate);
  const result = [];

  let currentYear = start.getFullYear();
  let currentMonth = start.getMonth();

  while (
    currentYear < end.getFullYear() ||
    (currentYear === end.getFullYear() && currentMonth <= end.getMonth())
  ) {
    result.push(currentMonth);
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return result;
}

async function generatePdf(token) {
  try {
    const fileName = `${token}_checklist.json`;
    const filePathChecklist = path.join(__dirname, "checklists", fileName);
    const filePathTemplate = path.join(__dirname, "template.html");
    const fileContentChecklist = fs.readFileSync(filePathChecklist, "utf-8");
    const fileContentTemplate = fs.readFileSync(filePathTemplate, "utf-8");
    const checklist = JSON.parse(fileContentChecklist);
    const window = new JSDOM("").window;
    const purify = DOMPurify(window);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const CategoryColors = [
      "rgb(184,253,97,0.45)",
      "rgba(253,184,97,0.45)",
      "rgba(97,184,253,0.45)",
      "rgba(253,97,184,0.45)",
      "rgba(97,253,184,0.45)",
      "rgba(184,97,253,0.45)",
    ];

    let htmlContent = "";
    let i = 0;
    for (const category in checklist) {
      if (category === "Удалённые") continue;

      htmlContent += `
        <div class="categoryWrapper" style="border: ${
          CategoryColors[i % 6]
        } solid 3px">
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
                  ? `<span class="count">X ${purify.sanitize(
                      item.count
                    )}</span>`
                  : ""
              }
            </div>
        `;
      }

      htmlContent += "</div></div>";
      i++;
    }

    const finalHtml = fileContentTemplate.replace("<!--INSERT-->", htmlContent);
    await page.setContent(finalHtml);

    fs.writeFileSync("output.html", finalHtml);

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "10px", right: "10px", bottom: "10px", left: "10px" },
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
  const days = $("li[class^=AppMonthCalendar_calendar__item]");

  let minTemp = Infinity;
  let maxTemp = -Infinity;

  days.each((i, el) => {
    const tempText = $(el)
      .find("[class^=AppMonthCalendarDay_temperature]")
      .text()
      .trim();
    const temps = tempText
      .split("°")
      .filter((t) => t.trim() !== "")
      .map((t) => t.replace("−", "-"))
      .map((t) => parseInt(t.trim(), 10));

    temps.forEach((t) => {
      if (!isNaN(t)) {
        if (t < minTemp) minTemp = t;
        if (t > maxTemp) maxTemp = t;
      }
    });
  });

  const textResult = $("[class^=AppMonthSeoText]").text();
  return { minTemp, maxTemp, textResult };
}

function addTemperatureBasedItems(minT, maxT, daysCount, add, checklist) {
  const N = daysCount;

  // === 1. Обувь (всегда в начале) ===
  add("Одежда", "Кроссовки", checklist);
  add("Одежда", "Обувь на дождь", checklist);

  if (minT <= 0) {
    add("Одежда", "Тёплая обувь", checklist);
  }
  if (maxT >= 20) {
    add("Одежда", "Сланцы", checklist);
  }

  // === 2. Куртки и верхняя одежда ===
  if (minT <= 0) {
    add("Одежда", "Тёплая куртка / пуховик", checklist);
  }
  if (minT <= 10 && maxT >= 0) {
    add("Одежда", "Куртка на переходную погоду", checklist);
  }
  if (minT <= 20 && maxT >= 10) {
    add("Одежда", "Ветровка", checklist);
  }

  // === 3. Всё остальное (по категориям) ===

  // Базовые вещи
  add("Одежда", "Нижнее бельё", checklist, Math.min(N, 7));
  add("Одежда", "Носки", checklist, Math.min(N, 7));
  add("Одежда", "Брюки / джинсы", checklist, Math.min(Math.ceil(N - 1 / 2), 2));
  add("Одежда", "Рубашка / футболка", checklist, Math.min(Math.ceil(N / 2), 4));

  // Холодная погода
  if (minT <= 0) {
    add("Одежда", "Термобельё (нижний слой)", checklist);
    add("Аксессуары", "Шапка / шарф / перчатки", checklist);
    add("Одежда", "Тёплые носки", checklist);
    add("Одежда", "Свитер / тёплая кофта", checklist);
  }

  // Переходная погода
  if (minT <= 10 && maxT >= 0) {
    add("Аксессуары", "Лёгкая шапка/шарф", checklist);
    add("Одежда", "Лёгкая кофта / кардиган", checklist);
  }

  // Тёплая погода
  if (maxT >= 15) {
    add("Аксессуары", "Кепка / панама", checklist);
    add("Гигиена", "Солнцезащитный крем", checklist);
    add("Аксессуары", "Солнцезащитные очки и чехол", checklist);
  }
  if (maxT >= 20) {
    add("Одежда", "Шорты", checklist, 2);
    add("Одежда", "Лёгкая майка", checklist, 2);
    add("Одежда", "Купальник", checklist);
  }
}

function buildPersonalChecklist(data, weather, checklist_temp) {
  /**
   * data = {
   *   gender: "female"|"male",
   *   country: string,
   *   startDate: "YYYY-MM-DD",
   *   endDate:   "YYYY-MM-DD",
   *   hobby:     "photography"|"sport"|"reading"|"other",
   *   vision:    true|false,         // есть ли проблемы со зрением
   *   specialMeds: Array<string>    // дополнительные лекарства
   * }
   * weather = { max_day_t: Number, prec_prob: Number }
   */
  const {
    gender,
    startDate,
    endDate,
    hobbies,
    has_eye_problems,
    has_sleep_problems,
    specialDrugs,
  } = data;
  const daysCount =
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
  const N = Math.ceil(daysCount);
  const checklist = structuredClone(checklist_temp);

  // 1) Пол
  if (gender === "female") {
    addItemToChecklist(
      "Гигиена",
      "Уходовая косметика для лица и тела",
      checklist
    );
    addItemToChecklist("Гигиена", "Средства личной гигиены", checklist);
    addItemToChecklist(
      "Гигиена",
      "Косметичка с декоративной косметикой",
      checklist
    );
    addItemToChecklist("Гигиена", "Мини‑фен", checklist);
    addItemToChecklist("Гигиена", "Украшения", checklist);
  }
  // если мужской — ничего не делаем

  addTemperatureBasedItems(
    weather.minTemp,
    weather.maxTemp,
    daysCount,
    addItemToChecklist,
    checklist
  );
  addItemToChecklist("Аксессуары", "Зонт / дождевик", checklist);

  // 4) Хобби
  function processHobbies(hobbies, checklist) {
   hobbies && hobbies.split("\n").forEach((hobby) => {
      switch (hobby) {
        case "photo":
          addItemToChecklist("Техника", "Фотоаппарат", checklist);
          addItemToChecklist("Техника", "Зарядка для фотоаппарата", checklist);
          addItemToChecklist("Техника", "Плёнка / картриджи", checklist);
          break;
        case "sport":
          addItemToChecklist("Одежда", "Комплект спортивной одежды", checklist);
          addItemToChecklist("Одежда", "Спортивные кроссовки", checklist);
          addItemToChecklist("Техника", "Бутылка для воды", checklist);
          break;
        case "book":
          addItemToChecklist("Прочее", "Книга в дорогу", checklist);
          addItemToChecklist(
            "Техника",
            "Планшет / электронная книга",
            checklist
          );
          addItemToChecklist("Прочее", "Закладка", checklist);
          break;
        default:
          addItemToChecklist(
            "Прочее",
            `Принадлежности для хобби: ${hobby}`,
            checklist
          );
          break;
      }
    });
  }
  processHobbies(hobbies, checklist);
  // 5) Зрение
  if (has_eye_problems) {
    addItemToChecklist("Гигиена", "Очки / линзы", checklist);
    addItemToChecklist("Гигиена", "Чехол / жидкость для линз", checklist);
  }
  if (has_sleep_problems) {
    addItemToChecklist("Гигиена", "Беруши", checklist);
    addItemToChecklist("Гигиена", "Маска для сна", checklist);
  }

  specialDrugs && addItemToChecklist("Лекарства", specialDrugs, checklist);

  return checklist;
}

module.exports = {
  addItemToChecklist,
  getMonthNumbersBetween,
  generatePdf,
  parseClimateData,
  buildPersonalChecklist,
};
