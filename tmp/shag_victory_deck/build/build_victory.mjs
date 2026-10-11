import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const W = 1280;
const H = 720;
const workspaceDir = "/Users/dmitrijzorin/IdeaProjects/untitled/price-hunter-front";
const skillDir = "/Users/dmitrijzorin/.codex/plugins/cache/openai-primary-runtime/presentations/26.903.11726/skills/presentations";
const buildDir = path.join(workspaceDir, "tmp/shag_victory_deck/build");
const finalPath = path.join(workspaceDir, "output/ШАГ ЛЕКЦИИ — Victory Group v2.pptx");
const candidatePath = path.join(buildDir, "candidate.pptx");
const previewDir = path.join(buildDir, "preview");

const { resolvePresentationFont, finalizePresentation } = await import(
  pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href,
);

const FONT = resolvePresentationFont({ fontFamily: "Arial" });
const C = {
  black: "#101010",
  black2: "#1C1C1C",
  graphite: "#393939",
  gray: "#A1A1A1",
  lightGray: "#D5D5D5",
  paper: "#F7F7F5",
  white: "#FFFFFF",
  lime: "#78DE13",
  limeSoft: "#E8F7D7",
  limeDark: "#4E9A0A",
};

async function saveBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

function shape(slide, geometry, left, top, width, height, fill, opts = {}) {
  return slide.shapes.add({
    geometry,
    name: opts.name,
    position: { left, top, width, height },
    fill,
    line: opts.line ?? { style: "solid", fill: "none", width: 0 },
  });
}

function text(slide, value, left, top, width, height, opts = {}) {
  const box = shape(slide, "textbox", left, top, width, height, "none", {
    name: opts.name,
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = value;
  box.text.style = {
    typeface: FONT,
    fontSize: opts.size ?? 20,
    bold: opts.bold ?? false,
    color: opts.color ?? C.white,
    alignment: opts.align ?? "left",
    verticalAlignment: opts.valign ?? "top",
    autoFit: "shrink",
  };
  return box;
}

function rule(slide, left, top, width, color, height = 1) {
  shape(slide, "rect", left, top, width, height, color, { name: "rule" });
}

function circle(slide, left, top, size, fill, label, labelColor = C.black) {
  shape(slide, "ellipse", left, top, size, size, fill, { name: "number" });
  text(slide, label, left, top + 1, size, size - 2, { size: Math.round(size * 0.38), bold: true, color: labelColor, align: "center", valign: "middle" });
}

function arrow(slide, left, top, width, height, color = C.lime) {
  shape(slide, "rightArrow", left, top, width, height, color, { name: "arrow" });
}

function baseSlide(deck, section, number, mode = "dark") {
  const isLight = mode === "light";
  const slide = deck.slides.add();
  slide.background.fill = isLight ? C.paper : C.black;
  const main = isLight ? C.black : C.white;
  const muted = isLight ? C.graphite : C.gray;
  rule(slide, 48, 38, 1184, C.lime, 3);
  text(slide, section.toUpperCase(), 48, 56, 560, 18, { size: 12, bold: true, color: C.lime });
  text(slide, `${String(number).padStart(2, "0")} / 11`, 1090, 56, 142, 18, { size: 12, bold: true, color: muted, align: "right" });
  return { slide, isLight, main, muted };
}

function title(ctx, heading, subtitle, opts = {}) {
  text(ctx.slide, heading, 48, opts.top ?? 105, opts.width ?? 1060, opts.height ?? 88, {
    size: opts.size ?? 42,
    bold: true,
    color: ctx.main,
    name: "title",
  });
  if (subtitle) {
    text(ctx.slide, subtitle, 50, opts.subTop ?? 202, opts.subWidth ?? 1010, opts.subHeight ?? 48, {
      size: opts.subSize ?? 19,
      color: ctx.muted,
      name: "subtitle",
    });
  }
}

function quoteStrip(ctx, value, top = 610) {
  shape(ctx.slide, "rect", 48, top, 1184, 54, C.lime, { name: "key-message" });
  text(ctx.slide, value, 74, top + 12, 1128, 28, { size: 18, bold: true, color: C.black, align: "center", valign: "middle" });
}

function addNotes(slide) {
  slide.speakerNotes.textFrame.setText(
    "[Sources]\n- https://victoryagency.ru/services/reputation (visual reference for palette, large uppercase typography and content rhythm; accessed 2026-09-04)\n[/Sources]",
  );
}

function cover(deck) {
  const slide = deck.slides.add();
  slide.background.fill = C.black;
  rule(slide, 48, 44, 1184, C.lime, 4);
  text(slide, "VICTORY GROUP / ORM SERVICE", 50, 66, 410, 20, { size: 13, bold: true, color: C.lime });
  text(slide, "ШАГ\nЛЕКЦИИ", 48, 142, 720, 176, { size: 80, bold: true, color: C.white, name: "cover-title" });
  text(slide, "Презентация продукта", 52, 340, 520, 44, { size: 30, bold: true, color: C.lime });
  text(slide, "Как объяснить ценность решения,\nсвязать его с проблемой и перейти к следующему шагу", 52, 404, 610, 64, { size: 21, color: C.lightGray });
  text(slide, "Лекция для менеджера", 52, 618, 330, 26, { size: 17, bold: true, color: C.white });
  text(slide, "ORM / управление репутацией", 52, 654, 420, 20, { size: 13, color: C.gray });

  text(slide, "01", 909, 116, 245, 178, { size: 164, bold: true, color: C.graphite, align: "right" });
  shape(slide, "rect", 772, 350, 405, 198, C.black2, { name: "cover-map", line: { style: "solid", fill: C.graphite, width: 1 } });
  text(slide, "ПРОБЛЕМА", 800, 383, 180, 22, { size: 15, bold: true, color: C.gray });
  text(slide, "РЕШЕНИЕ", 800, 443, 180, 22, { size: 15, bold: true, color: C.white });
  text(slide, "ВЫГОДА", 800, 503, 180, 22, { size: 15, bold: true, color: C.lime });
  rule(slide, 1008, 397, 132, C.graphite, 2);
  rule(slide, 1008, 457, 132, C.graphite, 2);
  circle(slide, 1134, 384, 28, C.lime, "1");
  circle(slide, 1134, 444, 28, C.white, "2");
  circle(slide, 1134, 504, 28, C.lime, "3");
  addNotes(slide);
}

function slide2(deck) {
  const ctx = baseSlide(deck, "цель этапа", 2, "dark");
  title(ctx, "Сначала сделайте\nценность понятной", "Клиент уже признал проблему. Теперь он должен увидеть, как решение поможет её устранить.", { height: 100 });
  const x = 50, y = 326, w = 507, h = 184;
  shape(ctx.slide, "rect", x, y, w, h, C.black2, { name: "before", line: { style: "solid", fill: C.graphite, width: 1 } });
  text(ctx.slide, "ДО ПРЕЗЕНТАЦИИ", x + 28, y + 28, 300, 20, { size: 13, bold: true, color: C.gray });
  text(ctx.slide, "«Я вижу проблему,\nно не вижу решения»", x + 28, y + 76, 402, 70, { size: 27, bold: true, color: C.white });
  arrow(ctx.slide, 587, 397, 100, 30);
  shape(ctx.slide, "rect", 724, y, w, h, C.lime, { name: "after" });
  text(ctx.slide, "ПОСЛЕ ПРЕЗЕНТАЦИИ", 752, y + 28, 330, 20, { size: 13, bold: true, color: C.black });
  text(ctx.slide, "«Я понимаю решение,\nвыгоду и следующий шаг»", 752, y + 76, 422, 70, { size: 27, bold: true, color: C.black });
  quoteStrip(ctx, "Задача менеджера: сделать связь «проблема → решение → выгода» очевидной для клиента.", 590);
}

function slide3(deck) {
  const ctx = baseSlide(deck, "логика лекции", 3, "light");
  title(ctx, "Логика раньше деталей", "Первые три шага помогают клиенту понять, зачем слушать о продукте и почему решение имеет отношение к его ситуации.");
  const items = [
    ["01", "Зачем нужен этап", "Показываем, какую задачу клиента решает презентация."],
    ["02", "Что происходит\nс клиентом", "Потребность уже есть, но решения и ценности он ещё не видит."],
    ["03", "В какое состояние\nпереводим", "Из «просто слушаю» — в «готов обсуждать решение»."],
  ];
  items.forEach(([num, heading, body], i) => {
    const x = 48 + i * 400;
    shape(ctx.slide, "rect", x, 320, 352, 218, i === 2 ? C.black : C.white, { name: "logic-card", line: { style: "solid", fill: i === 2 ? C.black : C.lightGray, width: 1 } });
    text(ctx.slide, num, x + 24, 348, 70, 24, { size: 15, bold: true, color: i === 2 ? C.lime : C.limeDark });
    text(ctx.slide, heading, x + 24, 392, 290, 58, { size: 24, bold: true, color: i === 2 ? C.white : C.black });
    text(ctx.slide, body, x + 24, 471, 292, 48, { size: 16, color: i === 2 ? C.lightGray : C.graphite });
    if (i < 2) arrow(ctx.slide, x + 352, 409, 48, 22, C.lime);
  });
  text(ctx.slide, "Сначала создайте для клиента понятный контекст решения. Характеристики — после логики.", 50, 610, 1030, 24, { size: 18, bold: true, color: C.graphite });
}

function slide4(deck) {
  const ctx = baseSlide(deck, "правила этапа", 4, "dark");
  title(ctx, "Меньше монолога —\nбольше связи с задачей", "Ценность создаётся через структуру, конкретику и вовлекающий вопрос после озвучивания стоимости.", { height: 96 });
  const columns = [
    ["ДЕЛАЕМ", ["Называем одну конкретную выгоду на одно свойство.", "Показываем, как решение влияет на ситуацию клиента.", "Задаём вопрос, который вовлекает в следующий шаг."], C.lime, C.black],
    ["ИЗБЕГАЕМ", ["Долгого рассказа о продукте без связи с проблемой.", "Пропуска названия компании и логики алгоритма.", "Озвучивания цены до того, как создана ценность."], C.black2, C.white],
  ];
  columns.forEach(([heading, items, fill, labelColor], col) => {
    const x = col === 0 ? 48 : 648;
    shape(ctx.slide, "rect", x, 310, 552, 235, fill, { name: "rule-panel", line: { style: "solid", fill: col === 0 ? C.lime : C.graphite, width: 1 } });
    text(ctx.slide, heading, x + 28, 338, 270, 24, { size: 15, bold: true, color: labelColor });
    items.forEach((item, i) => {
      circle(ctx.slide, x + 30, 389 + i * 48, 16, col === 0 ? C.black : C.lime, String(i + 1), col === 0 ? C.white : C.black);
      text(ctx.slide, item, x + 60, 382 + i * 48, 456, 40, { size: 16.5, color: col === 0 ? C.black : C.white });
    });
  });
  quoteStrip(ctx, "Клиент должен услышать не сумму к оплате, а цену решения своей задачи.", 602);
}

function slide5(deck) {
  const ctx = baseSlide(deck, "инструмент", 5, "light");
  title(ctx, "ССВ: формула\nценностного сообщения", "Свойство само по себе не продаёт. Клиенту нужен понятный переход от характеристики к выгоде.", { height: 95 });
  const parts = [
    ["С", "СВОЙСТВО", "Что есть в продукте: характеристика или действие.", C.white, C.black],
    ["С", "СВЯЗКА", "Мост к выгоде: «благодаря этому», «с помощью этого».", C.white, C.black],
    ["В", "ВЫГОДА", "Что меняется для клиента и почему это для него важно.", C.black, C.white],
  ];
  parts.forEach(([letter, heading, body, fill, ink], i) => {
    const x = 50 + i * 395;
    shape(ctx.slide, "rect", x, 340, 334, 200, fill, { name: "ssv", line: { style: "solid", fill: fill === C.black ? C.black : C.lightGray, width: 1 } });
    text(ctx.slide, letter, x + 24, 365, 60, 52, { size: 44, bold: true, color: C.lime });
    text(ctx.slide, heading, x + 24, 432, 270, 24, { size: 17, bold: true, color: ink });
    text(ctx.slide, body, x + 24, 474, 270, 45, { size: 15.5, color: fill === C.black ? C.lightGray : C.graphite });
    if (i < 2) arrow(ctx.slide, x + 334, 423, 48, 20);
  });
  quoteStrip(ctx, "Одна характеристика → одна связка → одна конкретная выгода", 602);
}

function slide6(deck) {
  const ctx = baseSlide(deck, "пример", 6, "dark");
  title(ctx, "Как собрать фразу\nпо ССВ", "Пример на базе модуля, который обновляет информацию в профиле компании.", { height: 94 });
  const rows = [
    ["СВОЙСТВО", "В рамках модуля мы обновляем информацию в профиле: добавляем новости", C.gray],
    ["СВЯЗКА", "Благодаря этому…", C.gray],
    ["ВЫГОДА", "Клиенты чаще находят компанию по ключевым запросам, а не только по названию", C.lime],
  ];
  rows.forEach(([label, value, accent], i) => {
    const y = 320 + i * 85;
    text(ctx.slide, String(i + 1).padStart(2, "0"), 52, y + 12, 46, 22, { size: 14, bold: true, color: accent });
    text(ctx.slide, label, 124, y + 10, 190, 22, { size: 14, bold: true, color: accent });
    rule(ctx.slide, 124, y + 45, 160, accent, 3);
    text(ctx.slide, `«${value}»`, 350, y + 2, 800, 54, { size: i === 2 ? 22 : 20, bold: i === 2, color: i === 2 ? C.white : C.lightGray });
  });
  quoteStrip(ctx, "Готовая фраза звучит как естественное объяснение, а не как перечисление терминов.", 608);
}

function slide7(deck) {
  const ctx = baseSlide(deck, "алгоритм", 7, "light");
  title(ctx, "Шаг 1–2: сначала объясняем,\nкто мы и что предлагаем", "Клиенту нужна короткая рамка: почему компании можно доверять и как устроено решение.", { size: 38, height: 94 });
  const cards = [
    ["ШАГ 1", "Презентация\nкомпании", "Коротко: кто мы, чем занимаемся и почему можем помочь решить задачу клиента.", "Пример: «Мы помогаем компаниям управлять репутацией в интернете»."],
    ["ШАГ 2", "Презентация ORM", "Объясняем, что ORM — это сервис управления репутацией с набором модулей.", "Задача: дать понятную рамку до перехода к конкретной проблеме."],
  ];
  cards.forEach(([label, heading, body, note], i) => {
    const x = i === 0 ? 50 : 657;
    const fill = i === 0 ? C.white : C.black;
    const ink = i === 0 ? C.black : C.white;
    shape(ctx.slide, "rect", x, 330, 575, 278, fill, { name: "step-card", line: { style: "solid", fill: i === 0 ? C.lightGray : C.black, width: 1 } });
    text(ctx.slide, label, x + 28, 351, 150, 18, { size: 14, bold: true, color: C.limeDark });
    text(ctx.slide, heading, x + 28, 394, 405, 57, { size: 27, bold: true, color: ink });
    text(ctx.slide, body, x + 28, 465, 452, 48, { size: 16, color: i === 0 ? C.graphite : C.lightGray });
    text(ctx.slide, note, x + 28, 548, 466, 48, { size: 15.5, bold: true, color: i === 0 ? C.black : C.lime });
  });
}

function slide8(deck) {
  const ctx = baseSlide(deck, "алгоритм", 8, "dark");
  title(ctx, "Шаг 3: верните клиента\nк его собственной проблеме", "Связка с ранее выявленной ситуацией делает предложение конкретным и помогает сохранить фокус клиента.", { size: 38, height: 94 });
  shape(ctx.slide, "rect", 48, 320, 474, 225, C.black2, { name: "weak", line: { style: "solid", fill: C.graphite, width: 1 } });
  text(ctx.slide, "СЛАБАЯ ПОДАЧА", 76, 348, 260, 20, { size: 14, bold: true, color: C.gray });
  text(ctx.slide, "«У нас есть модуль\nдля обновления карточек»", 76, 398, 390, 62, { size: 27, bold: true, color: C.white });
  text(ctx.slide, "Звучит как общий рассказ о продукте.", 76, 491, 366, 24, { size: 16, color: C.gray });
  arrow(ctx.slide, 552, 418, 110, 28);
  shape(ctx.slide, "rect", 708, 320, 524, 225, C.lime, { name: "strong" });
  text(ctx.slide, "СИЛЬНАЯ ПОДАЧА", 736, 348, 270, 20, { size: 14, bold: true, color: C.black });
  text(ctx.slide, "«Вы ранее отметили, что карточки\nпочти не обновляются. Именно\nс этим можем вам помочь»", 736, 394, 445, 90, { size: 24, bold: true, color: C.black });
  quoteStrip(ctx, "Каждый продуктовый тезис должен возвращать клиента к его реальной задаче.", 608);
}

function slide9(deck) {
  const ctx = baseSlide(deck, "алгоритм", 9, "light");
  title(ctx, "Шаг 4: презентуем модуль\nчерез его результат", "Выберите конкретный модуль под выявленную проблему и объясните его по формуле ССВ.", { size: 39, height: 96 });
  const parts = [
    ["ПРОБЛЕМА", "Карточки компании\nне обновляются", C.white, C.black],
    ["МОДУЛЬ", "Обновляем\nинформацию в профиле", C.white, C.black],
    ["ВЫГОДА", "Клиента чаще находят\nпо ключевым запросам", C.black, C.white],
  ];
  parts.forEach(([label, value, fill, ink], i) => {
    const x = 50 + i * 395;
    shape(ctx.slide, "rect", x, 330, 334, 210, fill, { name: "value-chain", line: { style: "solid", fill: fill === C.black ? C.black : C.lightGray, width: 1 } });
    text(ctx.slide, label, x + 25, 360, 200, 18, { size: 14, bold: true, color: fill === C.black ? C.lime : C.limeDark });
    text(ctx.slide, value, x + 25, 408, 270, 86, { size: i === 2 ? 21 : 25, bold: true, color: ink });
    if (i < 2) arrow(ctx.slide, x + 334, 418, 48, 22);
  });
  text(ctx.slide, "Проверка: может ли клиент повторить, какую именно проблему решает модуль?", 52, 600, 1040, 26, { size: 18, bold: true, color: C.graphite });
}

function slide10(deck) {
  const ctx = baseSlide(deck, "алгоритм", 10, "dark");
  title(ctx, "Стоимость — после\nсоздания ценности", "Стоимость звучит как цена решения задачи, когда клиент уже понял проблему, решение и выгоду.", { height: 96 });
  const stages = [
    ["01", "Проблема", "клиент признаёт,\nчто происходит"],
    ["02", "Решение", "видит, как мы\nпомогаем"],
    ["03", "Выгода", "понимает, что\nизменится"],
    ["04", "Стоимость", "оценивает цену\nрешения"],
    ["05", "Вопрос", "обсуждает\nследующий шаг"],
  ];
  stages.forEach(([num, heading, body], i) => {
    const x = 48 + i * 237;
    const active = i === 4;
    rule(ctx.slide, x, 348, 190, active ? C.lime : C.graphite, 4);
    text(ctx.slide, num, x, 378, 50, 20, { size: 13, bold: true, color: active ? C.lime : C.gray });
    text(ctx.slide, heading, x, 418, 195, 30, { size: 22, bold: true, color: C.white });
    text(ctx.slide, body, x, 466, 194, 52, { size: 15.5, color: C.gray });
    if (i < 4) arrow(ctx.slide, x + 194, 428, 30, 15, C.lime);
  });
  shape(ctx.slide, "rect", 48, 590, 1184, 66, C.lime, { name: "question" });
  text(ctx.slide, "Вовлекающий вопрос: «Подскажите, что скажете — готовы запуститься в работу?»", 76, 609, 1128, 28, { size: 19, bold: true, color: C.black, align: "center", valign: "middle" });
}

function slide11(deck) {
  const ctx = baseSlide(deck, "завершение", 11, "light");
  title(ctx, "Закрываем этап\nпроверкой результата", "После презентации важно понять: клиент согласен на следующий шаг или ему нужно помочь снять сопротивление.", { height: 100 });
  const actions = [
    ["01", "«Надо подумать»", "переходим к отработке возражения"],
    ["02", "«Выставляйте счёт»", "фиксируем договорённость и действие"],
    ["03", "«Пришлите КП»", "обсуждаем точный срок и следующий контакт"],
  ];
  actions.forEach(([num, label, body], i) => {
    const y = 340 + i * 68;
    text(ctx.slide, num, 50, y + 5, 44, 22, { size: 13, bold: true, color: C.limeDark });
    text(ctx.slide, label, 116, y, 240, 28, { size: 18, bold: true, color: C.black });
    text(ctx.slide, body, 392, y + 2, 330, 28, { size: 16, color: C.graphite });
    rule(ctx.slide, 116, y + 44, 572, C.lightGray, 1);
  });
  shape(ctx.slide, "rect", 770, 308, 462, 285, C.black, { name: "checklist" });
  text(ctx.slide, "ПРОВЕРЬТЕ\nПОНИМАНИЕ", 798, 339, 240, 52, { size: 16, bold: true, color: C.lime });
  ["1. Что такое презентация?", "2. Что будет, если пропустить шаг?", "3. Что делать, если клиент не понял?", "4. Как отличить согласие от ухода?"].forEach((item, i) => {
    text(ctx.slide, item, 798, 430 + i * 34, 400, 24, { size: 16.5, bold: true, color: C.white });
  });
  text(ctx.slide, "Резюме: возвращаемся к алгоритму, закрепляем формулу ССВ и договариваемся о следующем действии.", 50, 646, 1100, 22, { size: 14, color: C.graphite });
}

async function main() {
  await fs.mkdir(buildDir, { recursive: true });
  await fs.mkdir(previewDir, { recursive: true });
  await fs.mkdir(path.dirname(finalPath), { recursive: true });

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

  for (const [index, slide] of deck.slides.items.entries()) {
    const preview = await deck.export({ slide, format: "png", scale: 1 });
    await saveBlob(path.join(previewDir, `slide-${String(index + 1).padStart(2, "0")}.png`), preview);
  }

  await (await PresentationFile.exportPptx(deck)).save(candidatePath);
  const requirements = {
    explicitTotalSlideCount: 11,
    requiredNativeTableOwnerSlides: [],
    requiredNativeChartOwnerSlides: [],
  };
  await finalizePresentation({
    ...requirements,
    workspaceDir,
    candidatePath,
    finalPath,
    pythonExecutable: "/Users/dmitrijzorin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3",
    integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
    layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
    layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-bullet-geometry", "--validate-heading-fit"],
    fontPolicy: { basis: "design", families: [FONT] },
    verifyArtifactToolImport: true,
    receiptPath: path.join(buildDir, "validation-v2.json"),
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
