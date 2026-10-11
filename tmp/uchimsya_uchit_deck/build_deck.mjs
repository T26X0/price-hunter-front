import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const W = 1280;
const H = 720;
const OUT = process.argv[2] || "/Users/dmitrijzorin/IdeaProjects/untitled/price-hunter-front/Учимся учить — презентация.pptx";
const PREVIEW_DIR = process.argv[3] || "/Users/dmitrijzorin/IdeaProjects/untitled/price-hunter-front/tmp/uchimsya_uchit_deck/artifact_preview";

const C = {
  bg: "#FFFFFF",
  ink: "#0A0D12",
  muted: "#606874",
  rule: "#B8BCC4",
  panel: "#EDEDED",
  panel2: "#F7F8FA",
  blue: "#3D8DFF",
  blueLight: "#DCEEFF",
  sky: "#6DCBF4",
  dark: "#182235",
  white: "#FFFFFF",
};

async function saveBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

function addShape(slide, geometry, left, top, width, height, fill, line = { style: "solid", fill: "none", width: 0 }, name) {
  return slide.shapes.add({
    geometry,
    name,
    position: { left, top, width, height },
    fill,
    line,
  });
}

function addText(slide, text, left, top, width, height, opts = {}) {
  const box = addShape(slide, "textbox", left, top, width, height, "none", { style: "solid", fill: "none", width: 0 }, opts.name);
  box.text = text;
  box.text.style = {
    fontSize: opts.size ?? 20,
    bold: opts.bold ?? false,
    color: opts.color ?? C.ink,
    alignment: opts.align ?? "left",
    verticalAlignment: opts.valign ?? "top",
  };
  return box;
}

function addRule(slide, left, top, width, height = 2, color = C.rule) {
  addShape(slide, "rect", left, top, width, height, color, { style: "solid", fill: "none", width: 0 }, "rule");
}

function addBadge(slide, label, left, top, width = 120, color = C.blue) {
  addShape(slide, "roundRect", left, top, width, 28, color, { style: "solid", fill: color, width: 0 }, "badge");
  addText(slide, label.toUpperCase(), left + 10, top + 5, width - 20, 18, { size: 11, bold: true, color: C.white, align: "center", valign: "middle" });
}

function baseSlide(presentation, section, number) {
  const slide = presentation.slides.add();
  slide.background.fill = C.bg;
  addText(slide, section.toUpperCase(), 48, 38, 260, 20, { size: 11, bold: true, color: C.muted, name: "section" });
  addText(slide, String(number).padStart(2, "0"), 1160, 38, 72, 20, { size: 11, bold: true, color: C.muted, align: "right", name: "slide-number" });
  addRule(slide, 48, 67, 1184, 1, C.rule);
  return slide;
}

function addTitle(slide, title, subtitle) {
  addText(slide, title, 48, 92, 1080, 80, { size: 40, bold: true, name: "title" });
  if (subtitle) addText(slide, subtitle, 48, 179, 820, 44, { size: 18, color: C.muted, name: "subtitle" });
}

function addArrow(slide, x1, y1, x2, y2, color = C.blue) {
  const width = Math.max(4, x2 - x1);
  addShape(slide, "rightArrow", x1, y1, width, Math.max(18, y2 - y1), color, { style: "solid", fill: color, width: 0 }, "arrow");
}

function addStepCard(slide, index, title, detail, left, top, width, height, options = {}) {
  const fill = options.fill || C.panel2;
  addShape(slide, "roundRect", left, top, width, height, fill, { style: "solid", fill: options.line || C.rule, width: 1 }, "step-card");
  addShape(slide, "ellipse", left + 20, top + 20, 38, 38, options.accent || C.blue, { style: "solid", fill: options.accent || C.blue, width: 0 }, "step-number");
  addText(slide, String(index), left + 20, top + 28, 38, 20, { size: 16, bold: true, color: C.white, align: "center", valign: "middle" });
  addText(slide, title, left + 74, top + 18, width - 92, 32, { size: options.titleSize || 20, bold: true });
  addText(slide, detail, left + 22, top + 70, width - 44, height - 86, { size: options.detailSize || 15, color: C.muted });
}

function addBullet(slide, text, left, top, width, opts = {}) {
  addShape(slide, "ellipse", left, top + 8, 8, 8, opts.color || C.blue, { style: "solid", fill: opts.color || C.blue, width: 0 }, "bullet");
  addText(slide, text, left + 20, top, width - 20, opts.height || 42, { size: opts.size || 18, color: opts.textColor || C.ink, bold: opts.bold || false });
}

function addFooter(slide, text) {
  addRule(slide, 48, 654, 1184, 1, C.rule);
  addText(slide, text, 48, 668, 900, 18, { size: 10, color: C.muted });
}

function cover(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = C.bg;
  addText(slide, "ОБУЧЕНИЕ И РАЗВИТИЕ ПЕРСОНАЛА", 52, 46, 400, 20, { size: 12, bold: true, color: C.muted });
  addRule(slide, 52, 78, 1176, 2, C.ink);
  addText(slide, "Учимся\nучить", 52, 170, 590, 186, { size: 76, bold: true, color: C.ink, name: "cover-title" });
  addText(slide, "Как проводить обучающие встречи,\nкоторые меняют поведение сотрудника", 56, 392, 590, 78, { size: 25, color: C.dark, name: "cover-subtitle" });
  addShape(slide, "roundRect", 752, 163, 382, 306, C.dark, { style: "solid", fill: C.dark, width: 0 }, "cover-panel");
  addText(slide, "ЗНАНИЕ", 787, 206, 220, 30, { size: 19, bold: true, color: C.sky });
  addText(slide, "→", 794, 255, 70, 45, { size: 39, bold: true, color: C.white });
  addText(slide, "УМЕНИЕ", 866, 260, 200, 30, { size: 19, bold: true, color: C.white });
  addText(slide, "→", 875, 311, 70, 45, { size: 39, bold: true, color: C.white });
  addText(slide, "НАВЫК", 946, 316, 140, 30, { size: 19, bold: true, color: C.sky });
  addText(slide, "2 часть", 56, 592, 190, 30, { size: 21, bold: true, color: C.ink });
  addText(slide, "Материал для руководителя / наставника", 56, 628, 460, 22, { size: 13, color: C.muted });
}

function slide2(presentation) {
  const slide = baseSlide(presentation, "подготовка", 2);
  addTitle(slide, "Обучение начинается с наблюдаемого дефицита", "Сначала определяем, что именно в работе сотрудника требует развития.");
  const steps = [
    ["Проверить", "наблюдение по чек-листу"],
    ["Выбрать", "один дефицитный тематический блок"],
    ["Сформулировать", "учебную цель и критерии"],
    ["Проверить", "изменение в реальной работе"],
  ];
  steps.forEach(([title, detail], i) => {
    const x = 48 + i * 296;
    if (i < 3) addArrow(slide, x + 230, 385, x + 290, 405, C.blueLight);
    addShape(slide, "ellipse", x, 328, 70, 70, i === 3 ? C.blue : C.dark, { style: "solid", fill: i === 3 ? C.blue : C.dark, width: 0 }, "process-node");
    addText(slide, String(i + 1), x, 347, 70, 28, { size: 20, bold: true, color: C.white, align: "center", valign: "middle" });
    addText(slide, title, x, 426, 250, 30, { size: 21, bold: true });
    addText(slide, detail, x, 464, 238, 54, { size: 16, color: C.muted });
  });
  addShape(slide, "roundRect", 48, 564, 1184, 58, C.blueLight, { style: "solid", fill: C.blueLight, width: 0 }, "key-message");
  addText(slide, "Фокус встречи — не «рассказать всё», а убрать один конкретный дефицит в поведении.", 72, 580, 1110, 26, { size: 20, bold: true, color: C.dark, align: "center", valign: "middle" });
  addFooter(slide, "Выбор темы → учебная цель → работа по алгоритму → проверка результата");
}

function slide3(presentation) {
  const slide = baseSlide(presentation, "подготовка", 3);
  addTitle(slide, "От чек-листа к теме встречи", "Работайте последовательно: один тематический блок за одну обучающую встречу.");
  addShape(slide, "roundRect", 48, 256, 536, 292, C.panel2, { style: "solid", fill: C.rule, width: 1 }, "knowledge-panel");
  addBadge(slide, "диагностика", 72, 282, 150, C.dark);
  addText(slide, "Знания", 72, 335, 260, 34, { size: 28, bold: true });
  addText(slide, "Проверяем тестом или опросником", 72, 382, 430, 30, { size: 18, color: C.muted });
  addRule(slide, 72, 434, 390, 2, C.rule);
  addText(slide, "Вопрос: сотрудник понимает\nалгоритм и логику действий?", 72, 460, 430, 58, { size: 18, color: C.dark });
  addShape(slide, "roundRect", 640, 256, 592, 292, C.dark, { style: "solid", fill: C.dark, width: 0 }, "skill-panel");
  addBadge(slide, "диагностика", 664, 282, 150, C.blue);
  addText(slide, "Умения и навыки", 664, 335, 390, 34, { size: 28, bold: true, color: C.white });
  addText(slide, "Проверяем по чек-листу поведения", 664, 382, 450, 30, { size: 18, color: "#D7DEE9" });
  addRule(slide, 664, 434, 430, 2, "#526078");
  addText(slide, "Берём в работу пункты с оценкой 0 —\nи только один блок за встречу.", 664, 460, 460, 58, { size: 18, color: C.white, bold: true });
  addFooter(slide, "Чем точнее диагностика, тем конкретнее тема обучения.");
}

function slide4(presentation) {
  const slide = baseSlide(presentation, "подготовка", 4);
  addTitle(slide, "Учебная цель — это измеримый результат", "Она описывает, что сотрудник будет знать и делать после встречи — и как вы это проверите.");
  const cols = [
    ["Знает", "какой алгоритм использовать и почему", C.panel2],
    ["Умеет", "выполнить конкретное действие по алгоритму", C.blueLight],
    ["Подтверждает", "результат по заранее заданным критериям", C.dark],
  ];
  cols.forEach(([title, body, fill], i) => {
    const x = 48 + i * 398;
    addShape(slide, "roundRect", x, 280, 350, 184, fill, { style: "solid", fill: fill === C.dark ? C.dark : C.rule, width: fill === C.dark ? 0 : 1 }, "goal-card");
    addText(slide, title, x + 24, 310, 300, 34, { size: 25, bold: true, color: fill === C.dark ? C.white : C.ink });
    addText(slide, body, x + 24, 362, 300, 62, { size: 17, color: fill === C.dark ? "#D7DEE9" : C.muted });
  });
  addShape(slide, "roundRect", 48, 500, 1184, 100, C.panel2, { style: "solid", fill: C.rule, width: 1 }, "example");
  addText(slide, "Пример", 74, 523, 110, 22, { size: 13, bold: true, color: C.blue });
  addText(slide, "Сотрудник знает алгоритм установления контакта с ЛПР и применяет его при холодном звонке.", 190, 517, 980, 40, { size: 21, bold: true });
  addText(slide, "Критерий: воспроизводит действия по чек-листу в рабочей ситуации.", 190, 561, 900, 22, { size: 15, color: C.muted });
  addFooter(slide, "Формула: действие сотрудника + условия применения + критерий результата.");
}

function slide5(presentation) {
  const slide = baseSlide(presentation, "обучающая встреча", 5);
  addTitle(slide, "Вводная часть: включить сотрудника в обучение", "Её задача — снять неопределённость, показать значимость и договориться о совместной работе.");
  const items = [
    ["Зачем", "почему это важно в работе"],
    ["Цель", "какой результат ожидаем"],
    ["Польза", "что получит сам сотрудник"],
    ["Маршрут", "как пройдёт встреча"],
    ["Участие", "каких действий ждём от сотрудника"],
  ];
  items.forEach(([title, body], i) => {
    const y = 253 + i * 66;
    addShape(slide, "ellipse", 54, y + 8, 38, 38, i === 4 ? C.blue : C.dark, { style: "solid", fill: i === 4 ? C.blue : C.dark, width: 0 }, "intro-number");
    addText(slide, String(i + 1), 54, y + 17, 38, 18, { size: 14, bold: true, color: C.white, align: "center", valign: "middle" });
    addText(slide, title, 118, y + 5, 180, 28, { size: 20, bold: true });
    addText(slide, body, 315, y + 6, 680, 28, { size: 18, color: C.muted });
    if (i < 4) addRule(slide, 116, y + 57, 938, 1, C.rule);
  });
  addShape(slide, "roundRect", 922, 255, 310, 278, C.blueLight, { style: "solid", fill: C.blueLight, width: 0 }, "opening-script");
  addText(slide, "СТАРТОВАЯ\nФРАЗА", 950, 286, 180, 52, { size: 14, bold: true, color: C.blue });
  addText(slide, "«Сегодня разберём…,\nпотренируемся и\nзафиксируем, как\nприменить это в работе»", 950, 358, 250, 115, { size: 21, bold: true, color: C.dark });
  addFooter(slide, "Сильное начало создаёт ответственность за результат, а не ощущение «очередной лекции».");
}

function slide6(presentation) {
  const slide = baseSlide(presentation, "обучающая встреча", 6);
  addTitle(slide, "Алгоритм обучения: от знания к навыку", "Не перескакивайте через этапы: сотруднику нужно сначала понять, увидеть, попробовать с опорой — и только потом делать самостоятельно.");
  const stages = [
    ["Расскажу", "знание", "Сотрудник может воспроизвести информацию и ответить на вопросы."],
    ["Покажу", "пример", "Сотрудник увидел применение действий и понял, что наблюдать."],
    ["Сделаем\nвместе", "умение", "Сотрудник воспроизводит действие с опорой и подсказками."],
    ["Сделай\nсам", "навык", "Сотрудник выполняет действие без опоры и подсказок."],
  ];
  stages.forEach(([title, label, detail], i) => {
    const x = 48 + i * 300;
    if (i < 3) addArrow(slide, x + 246, 338, x + 292, 362, C.blueLight);
    addShape(slide, "roundRect", x, 286, 250, 225, i === 3 ? C.dark : C.panel2, { style: "solid", fill: i === 3 ? C.dark : C.rule, width: i === 3 ? 0 : 1 }, "learning-stage");
    addText(slide, String(i + 1), x + 23, 313, 42, 24, { size: 17, bold: true, color: i === 3 ? C.sky : C.blue });
    addText(slide, title, x + 23, 352, 186, 58, { size: 25, bold: true, color: i === 3 ? C.white : C.ink });
    addText(slide, label.toUpperCase(), x + 23, 422, 126, 18, { size: 11, bold: true, color: i === 3 ? C.sky : C.muted });
    addText(slide, detail, x + 23, 455, 204, 44, { size: 13.5, color: i === 3 ? "#D7DEE9" : C.muted });
  });
  addShape(slide, "roundRect", 48, 555, 1184, 56, C.blueLight, { style: "solid", fill: C.blueLight, width: 0 }, "benchmark");
  addText(slide, "Ориентир практики: 85% и выше — сначала с опорой, затем без неё.", 72, 572, 1125, 24, { size: 19, bold: true, color: C.dark, align: "center" });
  addFooter(slide, "Последовательность обучения: объяснение → наблюдение → тренировка → самостоятельное применение.");
}

function slide7(presentation) {
  const slide = baseSlide(presentation, "этап «расскажу»", 7);
  addTitle(slide, "Этап «Расскажу»: передаём знание", "Результат этапа — сотрудник может пересказать материал, воспроизвести алгоритм и ответить на вопросы.");
  const steps = [
    ["1", "Цель", "объясните, для чего нужен этот этап"],
    ["2", "Маршрут", "скажите, что и как будете делать"],
    ["3", "Лекция", "дайте структурированную информацию"],
    ["4", "Проверка", "задайте вопросы на понимание"],
  ];
  steps.forEach(([n, title, desc], i) => {
    const x = 48 + i * 230;
    addShape(slide, "roundRect", x, 292, 202, 214, C.panel2, { style: "solid", fill: C.rule, width: 1 }, "tell-step");
    addText(slide, n, x + 18, 315, 35, 28, { size: 18, bold: true, color: C.blue });
    addText(slide, title, x + 18, 356, 160, 30, { size: 22, bold: true });
    addText(slide, desc, x + 18, 406, 160, 56, { size: 15, color: C.muted });
    if (i < 3) addArrow(slide, x + 202, 378, x + 224, 394, C.blueLight);
  });
  addShape(slide, "roundRect", 1010, 292, 222, 214, C.dark, { style: "solid", fill: C.dark, width: 0 }, "tell-outcome");
  addText(slide, "ПРИЗНАК\nЗАВЕРШЕНИЯ", 1032, 322, 160, 48, { size: 12, bold: true, color: C.sky });
  addText(slide, "«Сотрудник\nобъясняет\nсвоими словами»", 1032, 396, 160, 78, { size: 21, bold: true, color: C.white });
  addFooter(slide, "Лекция — это не монолог. Проверка понимания встроена в сам этап.");
}

function slide8(presentation) {
  const slide = baseSlide(presentation, "этап «расскажу»", 8);
  addTitle(slide, "4 принципа сильного объяснения", "Смысл, структура и темп важнее объёма информации.");
  const cards = [
    ["Значимость", "Сначала объясните, зачем информация нужна и где пригодится на практике.", C.blueLight, C.ink],
    ["Структура", "Организуйте материал через определения, классификации, алгоритмы и принципы.", C.panel2, C.ink],
    ["От общего к частному", "Сначала базовые понятия и логика, затем шаги, детали и примеры.", C.panel2, C.ink],
    ["Порции", "Учитывайте ограниченный объём внимания и индивидуальный темп усвоения.", C.dark, C.white],
  ];
  cards.forEach(([title, body, fill, textColor], i) => {
    const x = i % 2 === 0 ? 48 : 652;
    const y = i < 2 ? 266 : 437;
    addShape(slide, "roundRect", x, y, 532, 135, fill, { style: "solid", fill: fill === C.dark ? C.dark : C.rule, width: fill === C.dark ? 0 : 1 }, "principle-card");
    addText(slide, String(i + 1).padStart(2, "0"), x + 22, y + 20, 44, 26, { size: 14, bold: true, color: fill === C.dark ? C.sky : C.blue });
    addText(slide, title, x + 86, y + 18, 390, 30, { size: 23, bold: true, color: textColor });
    addText(slide, body, x + 86, y + 60, 400, 50, { size: 15, color: fill === C.dark ? "#D7DEE9" : C.muted });
  });
  addFooter(slide, "Если информации слишком много — сократите, сгруппируйте или разделите на несколько встреч.");
}

function slide9(presentation) {
  const slide = baseSlide(presentation, "этап «расскажу»", 9);
  addTitle(slide, "Конструктор лекции по этапу продаж", "Восемь вопросов, которые помогают выстроить не набор фактов, а логику воздействия на клиента.");
  const points = [
    "Для чего нужен этот этап?",
    "Что происходит с клиентом?",
    "Какое состояние клиента меняем?",
    "Какие правила и принципы применяем?",
    "Какой алгоритм / инструмент используем?",
    "Как выглядит каждый шаг: что, почему, как?",
    "Как поймём, что результат достигнут?",
    "Какое резюме и какие вопросы зададим?",
  ];
  points.forEach((item, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    const x = col === 0 ? 48 : 660;
    const y = 250 + row * 79;
    addText(slide, String(i + 1).padStart(2, "0"), x, y + 8, 38, 24, { size: 15, bold: true, color: C.blue });
    addText(slide, item, x + 54, y, 510, 42, { size: 18, bold: true });
    addRule(slide, x + 54, y + 53, 510, 1, C.rule);
  });
  addShape(slide, "roundRect", 48, 590, 1184, 38, C.blueLight, { style: "solid", fill: C.blueLight, width: 0 }, "lesson-tip");
  addText(slide, "На каждом шаге давайте: действие → причина → влияние на клиента → пример формулировки.", 72, 599, 1120, 18, { size: 15, bold: true, color: C.dark, align: "center" });
  addFooter(slide, "Логика лекции помогает сотруднику понимать не только «что сказать», но и «зачем».");
}

function slide10(presentation) {
  const slide = baseSlide(presentation, "управление вниманием", 10);
  addTitle(slide, "Удерживаем внимание: визуализация + интонация", "Показывайте связи на слайде, а детали и эмоциональные акценты передавайте голосом.");
  addShape(slide, "roundRect", 48, 267, 560, 286, C.panel2, { style: "solid", fill: C.rule, width: 1 }, "visualization-panel");
  addText(slide, "ВИЗУАЛИЗАЦИЯ", 76, 296, 290, 24, { size: 14, bold: true, color: C.blue });
  addText(slide, "Показывайте структуру", 76, 337, 390, 30, { size: 24, bold: true });
  ["Фиксируйте главное, детали — голосом", "Алгоритмы показывайте схемой", "Используйте опорные фразы-шаблоны", "Систематизируйте информацию"].forEach((item, i) => addBullet(slide, item, 76, 387 + i * 36, 470, { size: 15, height: 28 }));
  addShape(slide, "roundRect", 664, 267, 568, 286, C.dark, { style: "solid", fill: C.dark, width: 0 }, "intonation-panel");
  addText(slide, "ИНТОНАЦИЯ", 692, 296, 260, 24, { size: 14, bold: true, color: C.sky });
  addText(slide, "Делайте речь живой", 692, 337, 420, 30, { size: 24, bold: true, color: C.white });
  ["Логическое ударение", "Пауза между смыслами", "Повышение / понижение тона", "Изменение темпа и громкости"].forEach((item, i) => addBullet(slide, item, 692, 387 + i * 36, 470, { size: 15, height: 28, color: C.sky, textColor: "#E4E8F0" }));
  addShape(slide, "roundRect", 48, 584, 1184, 42, C.blueLight, { style: "solid", fill: C.blueLight, width: 0 }, "attention-message");
  addText(slide, "То, что можно представить схемой или таблицей, — представляйте визуально.", 72, 595, 1120, 18, { size: 16, bold: true, color: C.dark, align: "center" });
  addFooter(slide, "Визуализация активизирует внимание, помогает восприятию и запоминанию.");
}

function slide11(presentation) {
  const slide = baseSlide(presentation, "управление вниманием", 11);
  addTitle(slide, "Проверяем понимание, а не только слушание", "Вопросы помогают сотруднику воспроизвести материал, увидеть смысл и перенести алгоритм в работу.");
  const rows = [
    ["01", "О содержании", "«Что означает…?»  «Из чего состоит…?»"],
    ["02", "О цели и применении", "«Для чего нужно…?»  «Что будет, если этого не сделать?»"],
    ["03", "О вариативности", "«Что предпримешь, если…?»  «В какой ситуации применишь…?»"],
    ["04", "О контроле", "«Как поймёшь, что применил успешно?»"],
  ];
  rows.forEach(([num, title, example], i) => {
    const y = 255 + i * 82;
    addShape(slide, "roundRect", 48, y, 1184, 64, i % 2 === 0 ? C.panel2 : C.blueLight, { style: "solid", fill: i % 2 === 0 ? C.rule : C.blueLight, width: i % 2 === 0 ? 1 : 0 }, "question-row");
    addText(slide, num, 72, y + 20, 48, 22, { size: 13, bold: true, color: C.blue });
    addText(slide, title, 154, y + 17, 315, 26, { size: 18, bold: true });
    addText(slide, example, 492, y + 18, 680, 24, { size: 15, color: C.dark });
  });
  addShape(slide, "roundRect", 48, 600, 1184, 30, C.dark, { style: "solid", fill: C.dark, width: 0 }, "questions-tip");
  addText(slide, "Не спрашивайте «всё понятно?» — попросите сотрудника объяснить, выбрать действие или спрогнозировать результат.", 72, 607, 1120, 16, { size: 13, bold: true, color: C.white, align: "center" });
  addFooter(slide, "Хороший вопрос проверяет понимание через действие и причинно-следственную связь.");
}

function slide12(presentation) {
  const slide = baseSlide(presentation, "практика", 12);
  addText(slide, "Соберите свою\nобучающую встречу", 48, 151, 650, 128, { size: 53, bold: true, name: "closing-title" });
  addText(slide, "Используйте алгоритм как рабочий сценарий —\nи закрепите навык в реальной деятельности сотрудника.", 52, 308, 612, 56, { size: 20, color: C.muted });
  const actions = [
    ["1", "Выберите", "один дефицитный блок"],
    ["2", "Сформулируйте", "цель и критерии"],
    ["3", "Подготовьте", "лекцию по конструктору"],
    ["4", "Проведите", "практику и обратную связь"],
  ];
  actions.forEach(([num, title, body], i) => {
    const y = 402 + i * 54;
    addText(slide, num, 52, y, 28, 20, { size: 14, bold: true, color: C.blue });
    addText(slide, title, 96, y - 2, 172, 24, { size: 17, bold: true });
    addText(slide, body, 278, y - 2, 310, 24, { size: 16, color: C.muted });
  });
  addShape(slide, "roundRect", 760, 151, 430, 406, C.dark, { style: "solid", fill: C.dark, width: 0 }, "closing-panel");
  addText(slide, "РАБОЧАЯ\nФОРМУЛА", 800, 190, 260, 54, { size: 14, bold: true, color: C.sky });
  addText(slide, "Расскажу", 800, 290, 256, 32, { size: 27, bold: true, color: C.white });
  addText(slide, "Покажу", 800, 340, 256, 32, { size: 27, bold: true, color: C.sky });
  addText(slide, "Сделаем вместе", 800, 390, 320, 32, { size: 27, bold: true, color: C.white });
  addText(slide, "Сделай сам", 800, 440, 260, 32, { size: 27, bold: true, color: C.sky });
  addText(slide, "→ закрепляем в реальной работе", 800, 500, 310, 24, { size: 16, color: "#D7DEE9" });
  addFooter(slide, "Главный результат обучения — сотрудник применяет нужное действие без подсказок.");
}

async function main() {
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  const deck = Presentation.create({ slideSize: { width: W, height: H } });
  cover(deck);
  slide2(deck);
  slide3(deck);
  slide4(deck);
  slide5(deck);
  slide6(deck);
  slide7(deck);
  slide8(deck);
  slide9(deck);
  slide10(deck);
  slide11(deck);
  slide12(deck);

  for (const [index, slide] of deck.slides.items.entries()) {
    await saveBlob(`${PREVIEW_DIR}/slide-${String(index + 1).padStart(2, "0")}.png`, await deck.export({ slide, format: "png", scale: 1 }));
  }
  await saveBlob(`${PREVIEW_DIR}/deck-montage.webp`, await deck.export({ format: "webp", montage: true, scale: 1 }));
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(OUT);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
