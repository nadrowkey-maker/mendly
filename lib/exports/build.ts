import PptxGenJS from "pptxgenjs";
import ExcelJS from "exceljs";

export interface PitchSlide {
  title: string;
  bullets: string[];
}

/** Build a dark, on-brand pitch deck (.pptx) → Node Buffer. */
export async function buildPitchPptx(projectName: string, slides: PitchSlide[]): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "MENDLY", width: 10, height: 5.625 });
  pptx.layout = "MENDLY";

  const cover = pptx.addSlide();
  cover.background = { color: "0A0A0C" };
  cover.addText(projectName, {
    x: 0.6, y: 2.1, w: 8.8, h: 1, fontSize: 40, bold: true, color: "FFFFFF", align: "center",
  });
  cover.addText("Pitch deck · drafted by your Mendly team", {
    x: 0.6, y: 3.1, w: 8.8, h: 0.5, fontSize: 14, color: "A78BFA", align: "center",
  });

  for (const s of slides) {
    const slide = pptx.addSlide();
    slide.background = { color: "0A0A0C" };
    slide.addText(s.title, {
      x: 0.6, y: 0.45, w: 8.8, h: 0.8, fontSize: 26, bold: true, color: "FFFFFF",
    });
    slide.addText(
      (s.bullets ?? []).map((b) => ({
        text: b,
        options: { bullet: true, color: "D6D6DD", fontSize: 16, paraSpaceAfter: 10 },
      })),
      { x: 0.7, y: 1.6, w: 8.6, h: 3.5, valign: "top" }
    );
  }

  return (await pptx.write({ outputType: "nodebuffer" })) as unknown as Buffer;
}

export interface FinancialRow {
  label: string;
  values: number[];
}

/** Build a simple financial model (.xlsx) → Node Buffer. */
export async function buildFinancialsXlsx(
  projectName: string,
  months: string[],
  rows: FinancialRow[],
  notes: string[]
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Mendly";
  const ws = wb.addWorksheet("Model");

  const titleRow = ws.addRow([`${projectName} — financial model`]);
  titleRow.font = { bold: true, size: 14 };
  ws.addRow([]);

  const header = ws.addRow(["", ...months]);
  header.font = { bold: true };

  for (const r of rows) {
    ws.addRow([r.label, ...r.values]);
  }

  if (notes.length) {
    ws.addRow([]);
    const n = ws.addRow(["Notes"]);
    n.font = { bold: true };
    for (const note of notes) ws.addRow([note]);
  }

  ws.getColumn(1).width = 28;
  for (let i = 2; i <= months.length + 1; i++) ws.getColumn(i).width = 12;

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf as ArrayBuffer);
}
