import jsPDF from "jspdf";

export interface PdfOptions {
  title: string;
  agentRole: string;
  projectName: string;
  date: Date;
  content: string;
  locale: "fr" | "en";
}

/**
 * Génère un PDF stylé Mendly à partir d'un contenu markdown.
 * Retourne un Buffer pour upload Supabase.
 */
export function generateMemoPdf(options: PdfOptions): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const contentWidth = pageWidth - 2 * marginX;

  // Mendly brand colors (RGB)
  const colors = {
    bg: [10, 7, 27] as const, // #0A071B
    text: [240, 240, 250] as const,
    muted: [160, 160, 180] as const,
    accent: [167, 139, 250] as const, // violet glow
    accentDark: [139, 92, 246] as const,
  };

  // ============= COVER HEADER =============
  // Background band
  doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
  doc.rect(0, 0, pageWidth, 50, "F");

  // Mendly logo text
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("MENDLY", marginX, 18);

  // Agent role badge
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.setFontSize(8);
  doc.text(`AGENT · ${options.agentRole}`, marginX, 26);

  // Date
  const dateStr = options.date.toLocaleDateString(
    options.locale === "fr" ? "fr-FR" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );
  const dateWidth = doc.getTextWidth(dateStr);
  doc.text(dateStr, pageWidth - marginX - dateWidth, 26);

  // Title
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(options.title, contentWidth);
  doc.text(titleLines, marginX, 42);

  // Project name subtitle
  let cursorY = 42 + titleLines.length * 7 + 4;
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const projectLabel = options.locale === "fr" ? "Projet :" : "Project:";
  doc.text(`${projectLabel} ${options.projectName}`, marginX, cursorY);
  cursorY += 8;

  // Divider
  doc.setDrawColor(colors.accentDark[0], colors.accentDark[1], colors.accentDark[2]);
  doc.setLineWidth(0.5);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 10;

  // ============= CONTENT =============
  doc.setTextColor(40, 40, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lines = options.content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Page break check
    if (cursorY > pageHeight - 25) {
      doc.addPage();
      cursorY = 25;
    }

    // Empty line — small space
    if (trimmed === "") {
      cursorY += 3;
      continue;
    }

    // H2 headings (## Title)
    if (trimmed.startsWith("## ")) {
      cursorY += 4;
      const headingText = trimmed.replace(/^##\s+/, "");
      doc.setTextColor(colors.accentDark[0], colors.accentDark[1], colors.accentDark[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(headingText, marginX, cursorY);
      cursorY += 8;
      doc.setTextColor(40, 40, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      continue;
    }

    // H3 headings (### Title)
    if (trimmed.startsWith("### ")) {
      cursorY += 2;
      const headingText = trimmed.replace(/^###\s+/, "");
      doc.setTextColor(colors.accentDark[0], colors.accentDark[1], colors.accentDark[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(headingText, marginX, cursorY);
      cursorY += 6;
      doc.setTextColor(40, 40, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      continue;
    }

    // Numbered list (1. **bold** — text)
    if (/^\d+\.\s/.test(trimmed)) {
      const text = renderInlineFormatting(doc, trimmed, marginX + 5, cursorY, contentWidth - 5);
      cursorY = text.endY + 3;
      continue;
    }

    // Bullet list (- item)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const bulletText = trimmed.replace(/^[-*]\s+/, "");
      doc.setTextColor(colors.accentDark[0], colors.accentDark[1], colors.accentDark[2]);
      doc.setFont("helvetica", "bold");
      doc.text("•", marginX + 2, cursorY);
      doc.setTextColor(40, 40, 50);
      doc.setFont("helvetica", "normal");
      const text = renderInlineFormatting(doc, bulletText, marginX + 8, cursorY, contentWidth - 8);
      cursorY = text.endY + 2;
      continue;
    }

    // Paragraph
    const text = renderInlineFormatting(doc, trimmed, marginX, cursorY, contentWidth);
    cursorY = text.endY + 4;
  }

  // ============= FOOTER =============
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const footerText = options.locale === "fr"
      ? `Mendly · Généré par ton CEO IA · Page ${i}/${pageCount}`
      : `Mendly · Generated by your AI CEO · Page ${i}/${pageCount}`;
    const footerWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10);
  }

  // Output as Buffer
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

/**
 * Renders text with inline **bold** support.
 * Returns the Y position after rendering.
 */
function renderInlineFormatting(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number
): { endY: number } {
  const lineHeight = 5.5;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  // Build segments with bold markers
  const segments: { text: string; bold: boolean }[] = [];
  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      segments.push({ text: part.slice(2, -2), bold: true });
    } else if (part) {
      segments.push({ text: part, bold: false });
    }
  }

  let currentX = x;
  let currentY = y;
  const startX = x;

  // Naive word wrap with bold support
  for (const segment of segments) {
    doc.setFont("helvetica", segment.bold ? "bold" : "normal");
    const words = segment.text.split(/(\s+)/);
    for (const word of words) {
      const wordWidth = doc.getTextWidth(word);
      if (currentX + wordWidth > startX + maxWidth && word.trim() !== "") {
        currentY += lineHeight;
        currentX = startX;
      }
      doc.text(word, currentX, currentY);
      currentX += wordWidth;
    }
  }

  doc.setFont("helvetica", "normal");
  return { endY: currentY };
}