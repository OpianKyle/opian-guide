import type { ToolkitSubmission } from "@workspace/api-client-react";
import {
  calculateToolkit,
  getToolkitAnswerSections,
  getToolkitName,
  type ToolkitAnswers,
  type ToolkitKind,
} from "@workspace/toolkit-core";

const NAVY = [27, 42, 74] as const;
const ORANGE = [224, 120, 32] as const;
const INK = [45, 52, 64] as const;
const MUTED = [105, 114, 130] as const;

const money = (value: string) => value.startsWith("R") ? value : `R ${value}`;

export async function downloadToolkitPdf(submission: ToolkitSubmission): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 17;
  const contentWidth = pageWidth - margin * 2;
  const bottom = pageHeight - 17;
  const kind = submission.toolkit as ToolkitKind;
  const answers = submission.answers as ToolkitAnswers;
  const analysis = calculateToolkit(kind, answers);
  let y = 22;

  const runningHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text("MyIFA  |  FINANCIAL TOOLKIT REPORT", margin, 12);
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.5);
    doc.line(margin, 15, pageWidth - margin, 15);
  };

  const newPage = () => {
    doc.addPage();
    y = 22;
    runningHeader();
  };

  const ensureSpace = (height: number) => {
    if (y + height > bottom) newPage();
  };

  const writeBlock = (
    text: string,
    options: { bold?: boolean; size?: number; color?: readonly [number, number, number]; gap?: number } = {},
  ) => {
    const { bold = false, size = 9, color = INK, gap = 1.5 } = options;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text || "—", contentWidth) as string[];
    const lineHeight = size * 0.48;
    for (const line of lines) {
      ensureSpace(lineHeight + 1);
      doc.text(line, margin, y);
      y += lineHeight;
    }
    y += gap;
  };

  const sectionTitle = (title: string) => {
    ensureSpace(12);
    doc.setFillColor(...NAVY);
    doc.roundedRect(margin, y, contentWidth, 7.5, 1.2, 1.2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3, y + 5.2);
    y += 11;
  };

  runningHeader();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...NAVY);
  doc.text(getToolkitName(kind), margin, y + 7);
  y += 14;
  writeBlock("Financial objectives and protection review", { size: 11, color: ORANGE, gap: 4 });
  writeBlock(`Prepared for: ${submission.clientName}`, { bold: true, size: 10, gap: 1 });
  writeBlock(submission.clientEmail, { color: MUTED, size: 9, gap: 1 });
  if (submission.businessName) writeBlock(`Business: ${submission.businessName}`, { color: MUTED, size: 9 });
  writeBlock(`Submitted: ${new Date(submission.createdAt).toLocaleDateString("en-ZA")}`, {
    color: MUTED,
    size: 9,
    gap: 5,
  });

  if (analysis.figures.length) {
    sectionTitle(analysis.figureTitle);
    for (const figure of analysis.figures) {
      ensureSpace(8);
      doc.setFont("helvetica", figure.total ? "bold" : "normal");
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text(figure.label, margin, y);
      doc.text(money(figure.value), pageWidth - margin, y, { align: "right" });
      if (figure.total) {
        doc.setDrawColor(...ORANGE);
        doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
      }
      y += 6;
    }
    writeBlock(analysis.figureNote, { size: 8, color: MUTED, gap: 4 });
  }

  if (analysis.objectives.length) {
    sectionTitle("Objectives to discuss");
    for (const objective of analysis.objectives) {
      ensureSpace(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...NAVY);
      doc.text(`${objective.top ? "Priority: " : ""}${objective.title}`, margin, y);
      y += 5;
      writeBlock(objective.description, { size: 8.5, gap: 2 });
    }
  }

  for (const section of getToolkitAnswerSections(kind, answers)) {
    sectionTitle(section.title);
    for (const row of section.rows) {
      writeBlock(row.label, { bold: true, size: 8, color: MUTED, gap: 0.3 });
      writeBlock(row.value, { size: 9, gap: 2 });
    }
  }

  sectionTitle("Important information");
  writeBlock(
    "This toolkit report is an indicative summary based on the information supplied. It is for discussion and educational purposes only and is not a financial needs analysis, recommendation, quotation or advice. Figures use simplified assumptions and should be checked with a qualified financial adviser before any decision is made.",
    { size: 8, gap: 2 },
  );
  writeBlock(
    "MyIFA will use the submitted personal information to review these objectives and contact the client as consented to, in accordance with applicable privacy requirements.",
    { size: 8, gap: 2 },
  );

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(
      `${getToolkitName(kind)}  |  Page ${page} of ${pages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" },
    );
  }

  const safeName = submission.clientName.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  const date = new Date(submission.createdAt).toISOString().slice(0, 10);
  doc.save(`MyIFA-${kind}-toolkit-${safeName || "client"}-${date}.pdf`);
}
