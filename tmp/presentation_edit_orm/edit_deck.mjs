import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const [inputPath, outputPath, qaDir] = process.argv.slice(2);
const starterPptxPath = inputPath;
if (!starterPptxPath || !outputPath || !qaDir) {
  throw new Error("Usage: edit_deck.mjs <input.pptx> <output.pptx> <qa-dir>");
}

async function writeBlob(filePath, blob) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

const presentation = await PresentationFile.importPptx(await FileBlob.load(starterPptxPath));
const before = await presentation.inspect({
  kind: "slide,textbox,shape,image,table,chart,notes,thread,layout",
  maxChars: 500000,
});

const records = before.ndjson
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));

function resolveNamedShape(slideNumber, name) {
  const candidates = records.filter(
    (record) => record.slide === slideNumber && record.id?.startsWith("sh/") && record.name === name,
  );
  if (candidates.length !== 1) {
    throw new Error(`Expected one shape named ${name} on slide ${slideNumber}; found ${candidates.length}.`);
  }
  return presentation.resolve(candidates[0].id);
}

function slideAt(number) {
  return presentation.slides.getItem(number - 1);
}

function deleteShape(shape) {
  if (typeof shape.delete === "function") {
    shape.delete();
    return;
  }
  if (typeof shape.remove === "function") {
    shape.remove();
    return;
  }
  throw new Error("The imported shape facade does not expose delete/remove.");
}

function setPageNumber(slideNumber) {
  const counter = resolveNamedShape(slideNumber, "Прямоугольник 14");
  counter.text = String(slideNumber).padStart(2, "0");
}

for (let slideNumber = 1; slideNumber <= 18; slideNumber += 1) {
  setPageNumber(slideNumber);
}

// Slide 4: make the three existing cards read as one causal flow.
{
  const slide = slideAt(4);
  const intent = resolveNamedShape(4, "Прямоугольник 16");
  const currentState = resolveNamedShape(4, "Прямоугольник 19");
  const targetState = resolveNamedShape(4, "Прямоугольник 22");
  slide.shapes.connect(intent, currentState, {
    kind: "straight",
    fromSide: "right",
    toSide: "left",
    line: { style: "solid", fill: "#70D83B", width: 3 },
    tail: { type: "arrow", width: "med", length: "med" },
  });
  slide.shapes.connect(currentState, targetState, {
    kind: "straight",
    fromSide: "right",
    toSide: "left",
    line: { style: "solid", fill: "#70D83B", width: 3 },
    tail: { type: "arrow", width: "med", length: "med" },
  });
  resolveNamedShape(4, "Прямоугольник 12").bringToFront();
  resolveNamedShape(4, "Прямоугольник 13").bringToFront();
}

const processShapeNames = [
  ["Прямоугольник 16", "Прямоугольник 17", "Прямоугольник 18"],
  ["Прямоугольник 19", "Прямоугольник 20", "Прямоугольник 21"],
  ["Прямоугольник 22", "Прямоугольник 23", "Прямоугольник 24"],
  ["Прямоугольник 25", "Прямоугольник 26", "Прямоугольник 27"],
];

for (let slideNumber = 6; slideNumber <= 9; slideNumber += 1) {
  const visibleStages = slideNumber - 5;
  for (let stageIndex = 0; stageIndex < processShapeNames.length; stageIndex += 1) {
    // Keep the imported overview untouched on the third reveal. This source
    // deck has an Office z-order incompatibility when its card styles change.
    if (slideNumber === 8) continue;
    const [cardName, numberName, bodyName] = processShapeNames[stageIndex];
    const card = resolveNamedShape(slideNumber, cardName);
    const number = resolveNamedShape(slideNumber, numberName);
    const body = resolveNamedShape(slideNumber, bodyName);
    const isActive = stageIndex < visibleStages;
    card.line = {
      style: "solid",
      fill: isActive ? "#70D83B" : "#26451E",
      width: isActive ? 2 : 1,
    };
    number.text.fill = isActive ? "#FFFFFF" : "#657063";
    body.text.fill = isActive ? "#C0C8C2" : "#657063";
  }

  // The current step appears through contrast, while the next steps stay
  // deliberately subdued until their turn in the sequence.
}

// Slide 18: reinforce the three-stage conclusion without changing its message.
{
  const conclusion = resolveNamedShape(18, "Прямоугольник 19");
  conclusion.text = "ФАКТЫ  →  ОСОЗНАНИЕ ПРОБЛЕМЫ  →  ЖЕЛАНИЕ РЕШИТЬ";
}

await fs.mkdir(qaDir, { recursive: true });
for (let index = 0; index < presentation.slides.items.length; index += 1) {
  const slide = presentation.slides.getItem(index);
  const number = String(index + 1).padStart(2, "0");
  await writeBlob(
    path.join(qaDir, `slide-${number}.png`),
    await presentation.export({ slide, format: "png", scale: 1 }),
  );
  await fs.writeFile(
    path.join(qaDir, `slide-${number}.layout.json`),
    await (await slide.export({ format: "layout" })).text(),
    "utf8",
  );
}
await writeBlob(
  path.join(qaDir, "deck-montage.webp"),
  await presentation.export({ format: "webp", montage: true, scale: 1 }),
);

const after = await presentation.inspect({
  kind: "slide,textbox,shape,image,table,chart,notes,thread,layout",
  maxChars: 500000,
});
await fs.writeFile(path.join(qaDir, "final-inspect.ndjson"), after.ndjson, "utf8");

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(outputPath);
