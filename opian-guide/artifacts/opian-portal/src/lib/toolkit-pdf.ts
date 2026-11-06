import type { jsPDF as JsPdfDocument } from "jspdf";
import type { ToolkitSubmission } from "@workspace/api-client-react";
import {
  calculateToolkit,
  getToolkitAnswerSections,
  getToolkitName,
  type ToolkitAnswers,
  type ToolkitKind,
} from "@workspace/toolkit-core";

type RGB = [number, number, number];

const BRAND = {
  navy: [27, 42, 74] as RGB,
  navyLight: [39, 57, 91] as RGB,
  navySoft: [56, 73, 105] as RGB,
  gold: [201, 165, 42] as RGB,
  goldLight: [247, 241, 222] as RGB,
  paper: [249, 248, 244] as RGB,
  white: [255, 255, 255] as RGB,
  ink: [39, 48, 62] as RGB,
  muted: [105, 114, 126] as RGB,
  line: [222, 224, 224] as RGB,
  pale: [244, 245, 245] as RGB,
  teal: [48, 119, 107] as RGB,
  green: [51, 135, 92] as RGB,
  red: [175, 78, 74] as RGB,
} as const;

const money = (value: string) => value.startsWith("R") ? value : `R ${value}`;

const parseMoney = (value?: string) => {
  if (!value) return 0;
  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const compactMoney = (value: number) => {
  if (value >= 1_000_000) {
    return `R ${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}m`;
  }
  if (value >= 10_000) return `R ${Math.round(value / 1_000)}k`;
  return `R ${Math.round(value).toLocaleString("en-ZA")}`;
};

const reportDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  }).format(date);
};

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

export async function downloadToolkitPdf(submission: ToolkitSubmission): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 17;
  const contentWidth = pageWidth - margin * 2;
  const contentBottom = pageHeight - 19;
  const kind = submission.toolkit as ToolkitKind;
  const answers = submission.answers as ToolkitAnswers;
  const analysis = calculateToolkit(kind, answers);
  const answerSections = getToolkitAnswerSections(kind, answers)
    .filter((section) => section.title !== "Your contact details");
  const title = getToolkitName(kind);
  const date = reportDate(submission.createdAt);
  let y = 22;

  const drawWordmark = (x: number, baseline: number, size: number, onDark = false) => {
    doc.setFont("times", "bold");
    doc.setFontSize(size);
    doc.setTextColor(...(onDark ? BRAND.white : BRAND.navy));
    doc.text("MY", x, baseline);
    const wordWidth = doc.getTextWidth("MY");
    doc.setTextColor(...BRAND.gold);
    doc.text("IFA", x + wordWidth + 0.7, baseline);
  };

  const addRunningHeader = () => {
    drawWordmark(margin, 13, 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.muted);
    doc.text(`${title.toUpperCase()}  |  CONFIDENTIAL`, pageWidth - margin, 13, { align: "right" });
    doc.setDrawColor(...BRAND.line);
    doc.setLineWidth(0.35);
    doc.line(margin, 17, pageWidth - margin, 17);
    y = 24;
  };

  const addPage = () => {
    doc.addPage();
    addRunningHeader();
  };

  const ensureSpace = (height: number) => {
    if (y + height > contentBottom) addPage();
  };

  const paragraph = (
    text: string,
    options: {
      size?: number;
      bold?: boolean;
      color?: RGB;
      width?: number;
      x?: number;
      gap?: number;
      lineHeight?: number;
      font?: "helvetica" | "times";
    } = {},
  ) => {
    const {
      size = 9,
      bold = false,
      color = BRAND.ink,
      width = contentWidth,
      x = margin,
      gap = 1.5,
      lineHeight = Math.max(3.6, size * 0.48),
      font = "helvetica",
    } = options;
    doc.setFont(font, bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text || "—", width) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight + 0.7);
      doc.setFont(font, bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...color);
      doc.text(line, x, y);
      y += lineHeight;
    }
    y += gap;
  };

  const sectionTitle = (heading: string, eyebrow?: string) => {
    ensureSpace(16);
    y += 2;
    if (eyebrow) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...BRAND.gold);
      doc.text(eyebrow.toUpperCase(), margin, y);
      y += 4.2;
    }
    doc.setFont("times", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...BRAND.navy);
    doc.text(heading, margin, y + 4.5);
    y += 8;
    doc.setDrawColor(...BRAND.gold);
    doc.setLineWidth(0.85);
    doc.line(margin, y + 1.5, margin + 15, y + 1.5);
    y += 7;
  };

  const drawCover = () => {
    const coverHeight = 92;
    doc.setFillColor(...BRAND.navy);
    doc.rect(0, 0, pageWidth, coverHeight, "F");

    // Restrained geometric rings echo the supplied report while keeping the
    // current MyIFA navy-and-gold identity.
    doc.setFillColor(...BRAND.navyLight);
    doc.circle(pageWidth - 29, 45, 41, "F");
    doc.setFillColor(...BRAND.navySoft);
    doc.circle(pageWidth - 29, 45, 30, "F");
    doc.setDrawColor(...BRAND.gold);
    doc.setLineWidth(0.55);
    doc.circle(pageWidth - 29, 45, 20, "S");
    doc.setFillColor(...BRAND.gold);
    doc.circle(pageWidth - 29, 45, 2.4, "F");

    drawWordmark(margin, 19, 16, true);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(220, 222, 226);
    doc.text("FINANCIAL ADVISORY", margin, 25);

    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("Financial objectives", margin, 43);
    doc.text("and protection review", margin, 54);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.gold);
    doc.text(`${title.toUpperCase()} REPORT`, margin, 63);

    const labelsY = 72;
    const valuesY = 80;
    const columns = [
      { x: margin, label: "PREPARED FOR", value: submission.clientName, width: 71 },
      { x: margin + 76, label: "DATE", value: date, width: 48 },
      { x: margin + 130, label: "REFERENCE", value: `MI-${submission.id}`, width: 42 },
    ];
    for (const column of columns) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(195, 202, 211);
      doc.text(column.label, column.x, labelsY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(doc.splitTextToSize(column.value || "—", column.width)[0], column.x, valuesY);
    }
    if (submission.businessName) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.8);
      doc.setTextColor(220, 222, 226);
      doc.text(submission.businessName, margin, 87);
    }

    doc.setFillColor(...BRAND.gold);
    doc.rect(0, coverHeight, pageWidth, 1.6, "F");
    y = coverHeight + 10;
  };

  const summaryCards = () => {
    const figure = (label: string) => analysis.figures.find((item) => item.label === label);
    const cards = kind === "personal"
      ? [
          { label: "OBJECTIVES IDENTIFIED", value: String(analysis.objectives.length), color: BRAND.gold },
          { label: "INDICATIVE COVER NEED", value: compactMoney(parseMoney(figure("Indicative life cover need")?.value)), color: BRAND.teal },
          { label: "INDICATIVE SHORTFALL", value: compactMoney(parseMoney(figure("Indicative shortfall")?.value)), color: BRAND.red },
        ]
      : [
          { label: "OBJECTIVES IDENTIFIED", value: String(analysis.objectives.length), color: BRAND.gold },
          { label: "BUSINESS DEBT", value: figure("Business debt to protect")?.value ?? "Not provided", color: BRAND.teal },
          { label: "12 MONTHS' OVERHEADS", value: figure("Twelve months of fixed overheads")?.value ?? "Not provided", color: BRAND.navy },
        ];
    const gap = 4;
    const cardWidth = (contentWidth - gap * 2) / 3;
    const cardHeight = 26;
    ensureSpace(cardHeight + 5);
    cards.forEach((card, index) => {
      const x = margin + index * (cardWidth + gap);
      doc.setFillColor(...BRAND.paper);
      doc.setDrawColor(...BRAND.line);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "FD");
      doc.setFillColor(...card.color);
      doc.roundedRect(x, y, 2, cardHeight, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.1);
      doc.setTextColor(...BRAND.muted);
      doc.text(card.label, x + 5, y + 7);
      doc.setFont("times", "bold");
      doc.setFontSize(card.value.length > 17 ? 11 : 14);
      doc.setTextColor(...BRAND.navy);
      doc.text(doc.splitTextToSize(card.value, cardWidth - 9)[0], x + 5, y + 18);
    });
    y += cardHeight + 5;
  };

  const drawChart = () => {
    const figure = (prefix: string) => analysis.figures.find((item) => item.label.startsWith(prefix));
    const rows = kind === "personal"
      ? [
          { label: "Indicative cover need", amount: parseMoney(figure("Indicative life cover need")?.value), color: BRAND.navy },
          { label: "Existing life cover", amount: parseMoney(figure("Existing life cover")?.value), color: BRAND.teal },
          { label: "Indicative shortfall", amount: parseMoney(figure("Indicative shortfall")?.value), color: BRAND.gold },
        ]
      : [
          { label: "Business debt to protect", amount: parseMoney(figure("Business debt to protect")?.value), color: BRAND.navy },
          { label: "Six months of fixed overheads", amount: parseMoney(figure("Six months of fixed overheads")?.value), color: BRAND.teal },
          { label: "Twelve months of fixed overheads", amount: parseMoney(figure("Twelve months of fixed overheads")?.value), color: BRAND.gold },
        ].filter((row) => row.amount > 0);

    sectionTitle(kind === "personal" ? "Your life cover picture" : "Business protection figures", "At a glance");
    paragraph(
      kind === "personal"
        ? "Compare the estimated cover need with the life cover you already have."
        : "A visual comparison of the debt and overhead figures you shared.",
      { size: 8.5, color: BRAND.muted, gap: 4 },
    );

    if (rows.length === 0 || rows.every((row) => row.amount === 0)) {
      paragraph("There are no monetary figures to chart from the answers provided.", { size: 8.5, color: BRAND.muted, gap: 4 });
      return;
    }

    const max = Math.max(...rows.map((row) => row.amount), 1);
    const labelWidth = 53;
    const valueWidth = 27;
    const barX = margin + labelWidth;
    const barWidth = contentWidth - labelWidth - valueWidth - 3;
    rows.forEach((row) => {
      ensureSpace(11);
      const lines = doc.splitTextToSize(row.label, labelWidth - 3) as string[];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND.ink);
      doc.text(lines.slice(0, 2), margin, y + (lines.length > 1 ? 0 : 1.2));
      const trackY = y + 1;
      doc.setFillColor(...BRAND.pale);
      doc.roundedRect(barX, trackY, barWidth, 4.2, 2, 2, "F");
      const fillWidth = row.amount > 0 ? Math.max(1.2, (row.amount / max) * barWidth) : 0;
      if (fillWidth > 0) {
        doc.setFillColor(...row.color);
        doc.roundedRect(barX, trackY, fillWidth, 4.2, 2, 2, "F");
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.4);
      doc.setTextColor(...BRAND.navy);
      doc.text(compactMoney(row.amount), pageWidth - margin, y + 4, { align: "right" });
      y += 9;
    });
    if (analysis.figureNote) {
      y += 1;
      paragraph(analysis.figureNote, { size: 7.7, color: BRAND.muted, gap: 4 });
    }
  };

  const drawObjectives = () => {
    if (!analysis.objectives.length) return;
    sectionTitle("Objectives to discuss", "Your priorities");
    analysis.objectives.forEach((objective, index) => {
      const bodyX = margin + 20;
      const bodyWidth = contentWidth - 25;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.3);
      const descriptionLines = doc.splitTextToSize(objective.description, bodyWidth) as string[];
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      const titleLines = doc.splitTextToSize(objective.title, bodyWidth) as string[];
      const labelHeight = 3.6;
      const titleHeight = titleLines.length * 4.2;
      const bodyHeight = descriptionLines.length * 3.8;
      const cardHeight = Math.max(24, 7 + labelHeight + titleHeight + 1.2 + bodyHeight + 4);
      ensureSpace(cardHeight + 2);

      const highlighted = objective.top;
      doc.setFillColor(...(highlighted ? BRAND.goldLight : BRAND.white));
      doc.setDrawColor(...(highlighted ? BRAND.gold : BRAND.line));
      doc.setLineWidth(highlighted ? 0.45 : 0.25);
      doc.roundedRect(margin, y, contentWidth, cardHeight, 2.1, 2.1, "FD");

      doc.setFillColor(...(highlighted ? BRAND.gold : BRAND.navy));
      doc.circle(margin + 9, y + 10, 4.2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(String(index + 1), margin + 9, y + 11.2, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.3);
      doc.setTextColor(...(highlighted ? BRAND.navy : objective.identified ? BRAND.gold : BRAND.muted));
      const marker = highlighted ? "TOP PRIORITY" : objective.identified ? "IDENTIFIED FROM YOUR ANSWERS" : "YOUR SELECTION";
      doc.text(marker, bodyX, y + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.ink);
      doc.text(titleLines, bodyX, y + 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.3);
      doc.setTextColor(...BRAND.muted);
      doc.text(descriptionLines, bodyX, y + 11 + titleHeight + 1.2);
      y += cardHeight + 2.5;
    });
  };

  const drawFigures = () => {
    if (!analysis.figures.length) return;
    sectionTitle(analysis.figureTitle, "The numbers");
    analysis.figures.forEach((figure) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const labelLines = doc.splitTextToSize(figure.label, contentWidth - 45) as string[];
      const rowHeight = Math.max(8, labelLines.length * 3.8 + 3);
      ensureSpace(rowHeight);
      if (figure.total) {
        doc.setFillColor(...BRAND.goldLight);
        doc.rect(margin, y, contentWidth, rowHeight, "F");
      }
      doc.setDrawColor(...BRAND.line);
      doc.setLineWidth(0.22);
      doc.line(margin, y, pageWidth - margin, y);
      doc.setFont("helvetica", figure.total ? "bold" : "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...(figure.total ? BRAND.navy : BRAND.muted));
      doc.text(labelLines, margin + 2, y + 4.5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(figure.total ? 9.5 : 8.8);
      doc.setTextColor(...(figure.total ? BRAND.navy : BRAND.ink));
      doc.text(money(figure.value), pageWidth - margin - 2, y + 4.5, { align: "right" });
      y += rowHeight;
    });
    y += 3;
  };

  const drawAnswerProfile = () => {
    if (!answerSections.length) return;
    sectionTitle("Your answers", "Toolkit profile");
    answerSections.forEach((section) => {
      ensureSpace(12);
      doc.setFillColor(...BRAND.navy);
      doc.circle(margin + 1.7, y + 1.7, 1.25, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.2);
      doc.setTextColor(...BRAND.navy);
      doc.text(section.title, margin + 6, y + 3);
      y += 6;

      section.rows.forEach((row, rowIndex) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const labelLines = doc.splitTextToSize(row.label, 72) as string[];
        doc.setFont("helvetica", "bold");
        const valueLines = doc.splitTextToSize(row.value, contentWidth - 82) as string[];
        const lineCount = Math.max(labelLines.length, valueLines.length);
        const rowHeight = Math.max(7, lineCount * 3.8 + 2.5);
        ensureSpace(rowHeight);
        if (rowIndex % 2 === 1) {
          doc.setFillColor(...BRAND.pale);
          doc.rect(margin, y, contentWidth, rowHeight, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...BRAND.muted);
        doc.text(labelLines, margin + 3, y + 4.2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...BRAND.ink);
        doc.text(valueLines, margin + 82, y + 4.2);
        y += rowHeight;
      });
      y += 3;
    });
  };

  const drawNextSteps = () => {
    sectionTitle("Your next steps", "Moving forward");
    const timeOfDay = submission.contactTime?.split(" (")[0]?.toLowerCase();
    const timeWindow = submission.contactTime?.match(/\(([^)]+)\)/)?.[1];
    const followUpTime = timeOfDay && timeOfDay !== "any time"
      ? ` in the ${timeOfDay}${timeWindow ? ` (${timeWindow})` : ""}`
      : "";
    const followUpCopy = submission.phone
      ? `A MyIFA adviser can follow up on ${submission.phone}${followUpTime}.`
      : "A MyIFA adviser can follow up using the contact details on your account.";
    const steps = [
      ["Review this summary", "Check that the priorities and figures reflect your current situation."],
      ["Talk with an adviser", followUpCopy],
      ["Build a suitable plan", "Consider options that fit your needs, budget and circumstances."],
    ];
    const gap = 4;
    const cardWidth = (contentWidth - gap * 2) / 3;
    const cardHeight = 35;
    ensureSpace(cardHeight + 4);
    steps.forEach(([heading, copy], index) => {
      const x = margin + index * (cardWidth + gap);
      doc.setFillColor(...BRAND.paper);
      doc.setDrawColor(...BRAND.line);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "FD");
      doc.setFillColor(...(index === 0 ? BRAND.gold : BRAND.navy));
      doc.circle(x + cardWidth / 2, y + 7, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(String(index + 1), x + cardWidth / 2, y + 8.1, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.3);
      doc.setTextColor(...BRAND.navy);
      doc.text(doc.splitTextToSize(heading, cardWidth - 8), x + cardWidth / 2, y + 16, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.3);
      doc.setTextColor(...BRAND.muted);
      const copyLines = doc.splitTextToSize(copy, cardWidth - 8) as string[];
      doc.text(copyLines, x + cardWidth / 2, y + 22, { align: "center" });
    });
    y += cardHeight + 6;
  };

  const drawImportantInformation = () => {
    const disclosures = [
      `This report is an indicative summary based on the answers provided in the ${title}. It is for discussion and educational purposes only. It is not a financial needs analysis, product recommendation, quotation, offer of insurance or financial advice.`,
      "Figures use simplified assumptions and may not account for all assets, liabilities, inflation, investment growth, tax or changes in your circumstances. A qualified financial adviser should verify the information and complete a full needs analysis before any decision is made.",
      "Insurance and investment products have terms, conditions, costs and exclusions. Any recommendation must be based on your needs and explained to you before you decide.",
      "MyIFA uses the information submitted with your consent to review your financial objectives and contact you about them, subject to applicable privacy requirements.",
    ];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    const disclosureHeight = disclosures.reduce(
      (height, text) => height + (doc.splitTextToSize(text, contentWidth) as string[]).length * 4 + 3,
      21,
    );
    ensureSpace(disclosureHeight);
    sectionTitle("Important information", "Please read");
    disclosures.forEach((text) => {
      paragraph(text, { size: 8.2, color: BRAND.muted, gap: 3, lineHeight: 4 });
    });
  };

  doc.setProperties({
    title: `MyIFA ${title} report`,
    subject: "Financial objectives and protection review",
    author: "MyIFA",
    creator: "MyIFA Financial Toolkit",
  });

  drawCover();
  paragraph(`Dear ${firstName(submission.clientName)},`, {
    font: "times",
    size: 12,
    bold: true,
    color: BRAND.navy,
    gap: 2,
  });
  paragraph(
    `Thank you for completing the MyIFA ${title.toLowerCase()}${submission.businessName ? ` for ${submission.businessName}` : ""}. This report brings together your answers, the objectives they point to and the figures behind them. Use it as the starting point for a conversation with your adviser.`,
    { size: 8.8, color: BRAND.muted, gap: 4 },
  );
  summaryCards();
  drawChart();
  drawObjectives();
  drawFigures();
  drawAnswerProfile();
  drawNextSteps();
  drawImportantInformation();

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...BRAND.line);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.muted);
    doc.text(`MyIFA  |  ${title}  |  Prepared for ${submission.clientName}`, margin, pageHeight - 9);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 9, { align: "right" });
  }

  const safeName = submission.clientName.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  const dateKey = new Date(submission.createdAt).toISOString().slice(0, 10);
  doc.save(`MyIFA-${kind}-toolkit-${safeName || "client"}-${dateKey}.pdf`);
}
