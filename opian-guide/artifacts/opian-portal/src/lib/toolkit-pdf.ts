import type { jsPDF as JsPdfDocument } from "jspdf";
import type { ToolkitSubmission } from "@workspace/api-client-react";
import {
  calculateToolkit,
  getToolkitAnswerSections,
  getToolkitName,
  type ToolkitAnswers,
  type ToolkitKind,
  type ToolkitAnalysis,
} from "@workspace/toolkit-core";

type RGB = [number, number, number];
type ProtectionStatus = "On track" | "Partly covered" | "Gap" | "Discuss";

interface ProtectionCheck {
  label: string;
  description: string;
  status: ProtectionStatus;
}

const BRAND = {
  navy: [27, 42, 74] as RGB,
  navyDeep: [18, 32, 56] as RGB,
  navySoft: [48, 65, 95] as RGB,
  orange: [238, 119, 35] as RGB,
  gold: [201, 165, 42] as RGB,
  green: [49, 126, 100] as RGB,
  greenPale: [237, 244, 239] as RGB,
  orangePale: [255, 244, 232] as RGB,
  goldPale: [249, 246, 231] as RGB,
  paper: [249, 249, 246] as RGB,
  white: [255, 255, 255] as RGB,
  ink: [39, 48, 62] as RGB,
  muted: [105, 114, 126] as RGB,
  line: [222, 224, 224] as RGB,
  pale: [244, 245, 245] as RGB,
  red: [175, 78, 74] as RGB,
  redPale: [250, 239, 237] as RGB,
} as const;

const amountFromText = (value?: string): number => {
  if (!value) return 0;
  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value: string | number) => {
  const text = String(value);
  return /^R\s?/i.test(text) ? text : `R ${text}`;
};

const moneyFromAmount = (value: number) =>
  `R ${Math.round(value).toLocaleString("en-ZA").replace(/[,\u00a0\u202f]/g, " ")}`;

const compactMoney = (value: number) => {
  if (!value) return "R 0";
  if (value >= 1_000_000) {
    return `R ${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}m`;
  }
  if (value >= 10_000) return `R ${Math.round(value / 1_000)}k`;
  return moneyFromAmount(value);
};

const dateLabel = (value: string) => {
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
const answerText = (answers: ToolkitAnswers, key: string) => String(answers[key] ?? "");
const figureByPrefix = (analysis: ToolkitAnalysis, prefix: string) =>
  analysis.figures.find((figure) => figure.label.startsWith(prefix));

function personalProtectionChecks(answers: ToolkitAnswers, analysis: ToolkitAnalysis): ProtectionCheck[] {
  const need = amountFromText(figureByPrefix(analysis, "Indicative life cover need")?.value);
  const cover = amountFromText(figureByPrefix(analysis, "Existing life cover")?.value);
  const funeral = answerText(answers, "funeralCover");
  const disability = answerText(answers, "disCover");
  const medical = answerText(answers, "medical");
  const savings = answerText(answers, "savings");
  const will = answerText(answers, "will");
  const work = answerText(answers, "work");

  const lifeStatus: ProtectionStatus = need <= 0
    ? "Discuss"
    : cover <= 0
      ? "Gap"
      : cover < need
        ? "Partly covered"
        : "On track";

  return [
    {
      label: "Life cover",
      description: need > 0
        ? `You have ${moneyFromAmount(cover)} against an indicative need of ${moneyFromAmount(need)}.`
        : "A full needs analysis can confirm whether your current cover is suitable.",
      status: lifeStatus,
    },
    {
      label: "Disability and income protection",
      description: disability === "Yes"
        ? "You told us you have cover. Check what it pays and when it would pay."
        : "Can help replace income if illness or injury stops you from working.",
      status: disability === "Yes"
        ? "On track"
        : disability === "No" && !["Retired", "Not working at the moment"].includes(work)
          ? "Gap"
          : "Discuss",
    },
    {
      label: "Funeral cover",
      description: funeral === "Yes"
        ? "You told us you have funeral cover. Check who is included and the benefit amount."
        : "A quick payout can help your family manage funeral expenses.",
      status: funeral === "Yes" ? "On track" : funeral === "No" ? "Gap" : "Discuss",
    },
    {
      label: "Medical aid or hospital plan",
      description: medical === "Yes"
        ? "You told us you have a plan. Check that the cover still suits your needs."
        : "Helps with eligible treatment and hospital costs.",
      status: medical === "Yes" ? "On track" : medical === "No" ? "Gap" : "Discuss",
    },
    {
      label: "Emergency fund",
      description: savings
        ? `Your savings could cover: ${savings.toLowerCase()} months of expenses.`
        : "A reserve for unexpected costs can reduce reliance on debt.",
      status: savings === "None"
        ? "Gap"
        : savings === "Less than 3"
          ? "Partly covered"
          : savings === "3 to 6" || savings === "More than 6"
            ? "On track"
            : "Discuss",
    },
    {
      label: "Valid will",
      description: will === "Yes"
        ? "You told us you have a valid will. Review it after major life changes."
        : "A current will records how you want your estate to be handled.",
      status: will === "Yes" ? "On track" : will === "No" ? "Gap" : will === "Needs updating" ? "Partly covered" : "Discuss",
    },
    {
      label: "Critical illness cover",
      description: "This toolkit does not ask about critical illness cover; discuss whether it is relevant to you.",
      status: "Discuss",
    },
  ];
}

function businessProtectionChecks(answers: ToolkitAnswers): ProtectionCheck[] {
  const loans = amountFromText(String(answers.loans ?? ""));
  const owners = answerText(answers, "owners");
  const agreement = answerText(answers, "bsaExists");
  const keyReliance = answerText(answers, "keyRely");
  const ownerCover = answerText(answers, "ownerCover");
  const benefits = answerText(answers, "benefits");

  return [
    {
      label: "Business debt and sureties",
      description: loans > 0
        ? `You reported ${moneyFromAmount(loans)} in business debt. Review how it would be settled and whether any personal sureties apply.`
        : "Confirm that debt levels and any personal sureties are recorded accurately.",
      status: loans > 0 ? "Discuss" : "On track",
    },
    {
      label: "Buy-and-sell agreement",
      description: owners === "1"
        ? "This usually applies when a business has more than one owner."
        : "A signed and funded agreement can help the remaining owners buy a departing owner's share.",
      status: owners === "1"
        ? "Discuss"
        : agreement === "Yes, and it is funded"
          ? "On track"
          : agreement === "Yes, but it is not funded"
            ? "Partly covered"
            : agreement === "No"
              ? "Gap"
              : "Discuss",
    },
    {
      label: "Key-person exposure",
      description: keyReliance === "Yes, significantly"
        ? "You expect a significant revenue impact if a key person is lost. Review a continuity plan and funding options."
        : "Review which people, skills or relationships are essential to trading.",
      status: keyReliance === "Yes, significantly" ? "Discuss" : keyReliance === "Not really" ? "On track" : "Discuss",
    },
    {
      label: "Fixed overheads",
      description: "The toolkit records monthly overheads, but does not ask whether business overhead cover is in place.",
      status: "Discuss",
    },
    {
      label: "Owners' personal cover",
      description: "Personal cover can help protect an owner's household as well as the business.",
      status: ownerCover === "Yes, all of them"
        ? "On track"
        : ownerCover === "Some of them"
          ? "Partly covered"
          : ownerCover === "No"
            ? "Gap"
            : "Discuss",
    },
    {
      label: "Staff benefits",
      description: "Review whether your benefits are suitable for the people you employ.",
      status: benefits === "Yes" ? "On track" : benefits === "Some, but not all" ? "Partly covered" : benefits === "No" ? "Gap" : "Discuss",
    },
    {
      label: "Business continuity and succession",
      description: "Consider who would run or own the business if you or another owner could no longer do so.",
      status: "Discuss",
    },
  ];
}

function getStatusColor(status: ProtectionStatus): RGB {
  if (status === "On track") return BRAND.green;
  if (status === "Partly covered") return BRAND.gold;
  if (status === "Gap") return BRAND.orange;
  return BRAND.muted;
}

function getStatusPale(status: ProtectionStatus): RGB {
  if (status === "On track") return BRAND.greenPale;
  if (status === "Partly covered") return BRAND.goldPale;
  if (status === "Gap") return BRAND.orangePale;
  return BRAND.pale;
}

export async function downloadToolkitPdf(submission: ToolkitSubmission): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const contentBottom = pageHeight - 18;
  const kind = submission.toolkit as ToolkitKind;
  const answers = submission.answers as ToolkitAnswers;
  const analysis = calculateToolkit(kind, answers);
  const answerSections = getToolkitAnswerSections(kind, answers)
    .filter((section) => section.title !== "Your contact details");
  const date = dateLabel(submission.createdAt);
  const reportTitle = "Financial objectives report";
  const toolkitLabel = `${kind === "personal" ? "Personal" : "Business"} Toolkit results`;
  const reference = `MI-${String(submission.id).padStart(6, "0")}`;
  let y = 24;

  const drawWordmark = (x: number, baseline: number, size: number, onDark = false) => {
    doc.setFont("times", "bold");
    doc.setFontSize(size);
    doc.setTextColor(...(onDark ? BRAND.white : BRAND.navy));
    doc.text("MY", x, baseline);
    const wordWidth = doc.getTextWidth("MY");
    doc.setTextColor(...BRAND.orange);
    doc.text("IFA", x + wordWidth + 0.6, baseline);
  };

  const addRunningHeader = (continued = false) => {
    drawWordmark(margin, 13, 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.3);
    doc.setTextColor(...BRAND.muted);
    doc.text(
      `${reportTitle}${continued ? " (continued)" : ""} | ${submission.clientName}`,
      pageWidth - margin,
      13,
      { align: "right" },
    );
    doc.setDrawColor(...BRAND.line);
    doc.setLineWidth(0.35);
    doc.line(margin, 17, pageWidth - margin, 17);
    y = 24;
  };

  const addPage = (continued = true) => {
    doc.addPage();
    addRunningHeader(continued);
  };

  const ensureSpace = (height: number) => {
    if (y + height > contentBottom) addPage(true);
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
      align?: "left" | "center" | "right";
    } = {},
  ) => {
    const {
      size = 8.5,
      bold = false,
      color = BRAND.ink,
      width = contentWidth,
      x = margin,
      gap = 1.5,
      lineHeight = Math.max(3.7, size * 0.48),
      font = "helvetica",
      align = "left",
    } = options;
    const lines = doc.splitTextToSize(text || "—", width) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight + 0.7);
      doc.setFont(font, bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...color);
      doc.text(line, x, y, { align });
      y += lineHeight;
    }
    y += gap;
  };

  const sectionHeading = (eyebrow: string, heading: string, intro?: string) => {
    ensureSpace(intro ? 23 : 16);
    y += 1;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.orange);
    doc.text(eyebrow.toUpperCase(), margin, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.navy);
    doc.text(heading, margin, y);
    y += 2;
    doc.setDrawColor(...BRAND.orange);
    doc.setLineWidth(0.85);
    doc.line(margin, y + 1, margin + 13, y + 1);
    y += 5;
    if (intro) {
      paragraph(intro, { size: 8.1, color: BRAND.muted, gap: 2, lineHeight: 3.8 });
    }
  };

  const drawCover = () => {
    const coverHeight = 91;
    doc.setFillColor(...BRAND.navyDeep);
    doc.rect(0, 0, pageWidth, coverHeight, "F");

    // Quiet geometric details echo the reference layout without reusing its
    // non-MyIFA flower mark.
    doc.setFillColor(...BRAND.navy);
    doc.circle(pageWidth - 29, 42, 41, "F");
    doc.setFillColor(...BRAND.navySoft);
    doc.circle(pageWidth - 29, 42, 30, "F");
    doc.setDrawColor(...BRAND.gold);
    doc.setLineWidth(0.55);
    doc.circle(pageWidth - 29, 42, 19, "S");
    doc.setFillColor(...BRAND.orange);
    doc.circle(pageWidth - 29, 42, 2.2, "F");

    drawWordmark(margin, 19, 15, true);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(218, 223, 232);
    doc.text("FINANCIAL SERVICES", margin, 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(23);
    doc.setTextColor(...BRAND.white);
    doc.text("Financial objectives", margin, 43);
    doc.text("report", margin, 54);
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND.orange);
    doc.text(toolkitLabel.toUpperCase(), margin, 63);

    const columns = [
      { x: margin, label: "PREPARED FOR", value: submission.clientName, width: 66 },
      { x: margin + 73, label: "DATE", value: date, width: 48 },
      { x: margin + 128, label: "REFERENCE", value: reference, width: 51 },
    ];
    for (const column of columns) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.4);
      doc.setTextColor(188, 198, 213);
      doc.text(column.label, column.x, 74);
      doc.setFontSize(8.5);
      doc.setTextColor(...BRAND.white);
      const valueLines = doc.splitTextToSize(column.value || "—", column.width) as string[];
      doc.text(valueLines[0] ?? "—", column.x, 81);
    }
    if (submission.businessName) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.4);
      doc.setTextColor(218, 223, 232);
      doc.text(submission.businessName, margin, 87);
    }
    doc.setFillColor(...BRAND.orange);
    doc.rect(0, coverHeight, pageWidth, 1.5, "F");
    y = coverHeight + 9;
  };

  const drawSummaryCards = () => {
    const lifeNeed = amountFromText(figureByPrefix(analysis, "Indicative life cover need")?.value);
    const shortfall = amountFromText(figureByPrefix(analysis, "Indicative shortfall")?.value);
    const businessDebt = amountFromText(figureByPrefix(analysis, "Business debt to protect")?.value);
    const annualOverheads = amountFromText(figureByPrefix(analysis, "Twelve months of fixed overheads")?.value);
    const cards = kind === "personal"
      ? [
          { label: "OBJECTIVES IDENTIFIED", value: String(analysis.objectives.length), color: BRAND.orange },
          { label: "INDICATIVE COVER NEED", value: compactMoney(lifeNeed), color: BRAND.green },
          { label: "INDICATIVE SHORTFALL", value: compactMoney(shortfall), color: BRAND.orange },
        ]
      : [
          { label: "OBJECTIVES IDENTIFIED", value: String(analysis.objectives.length), color: BRAND.orange },
          { label: "BUSINESS DEBT", value: compactMoney(businessDebt), color: BRAND.green },
          { label: "12 MONTHS' OVERHEADS", value: compactMoney(annualOverheads), color: BRAND.navy },
        ];
    const gap = 4;
    const cardWidth = (contentWidth - gap * 2) / 3;
    const cardHeight = 22;
    ensureSpace(cardHeight + 3);
    cards.forEach((card, index) => {
      const x = margin + index * (cardWidth + gap);
      doc.setFillColor(...BRAND.greenPale);
      doc.setDrawColor(...BRAND.line);
      doc.setLineWidth(0.2);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "FD");
      doc.setFillColor(...card.color);
      doc.roundedRect(x, y, cardWidth, 1.5, 0.7, 0.7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.1);
      doc.setTextColor(...BRAND.muted);
      doc.text(card.label, x + 5, y + 7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(card.value.length > 16 ? 10.5 : 13);
      doc.setTextColor(...BRAND.navy);
      doc.text(doc.splitTextToSize(card.value, cardWidth - 10)[0], x + 5, y + 17);
    });
    y += cardHeight + 4;
  };

  const drawLegendItem = (x: number, baseline: number, color: RGB, label: string, outline = false) => {
    doc.setFillColor(...color);
    doc.setDrawColor(...color);
    doc.setLineWidth(0.35);
    doc.rect(x, baseline - 2.4, 3, 2.4, outline ? "S" : "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.4);
    doc.setTextColor(...BRAND.muted);
    doc.text(label, x + 4.3, baseline - 0.3);
    return x + 4.3 + doc.getTextWidth(label) + 6;
  };

  const drawDonut = (cx: number, cy: number, percent: number) => {
    const segments = 56;
    const radius = 8.8;
    const dotRadius = 0.72;
    for (let index = 0; index < segments; index += 1) {
      const angle = (Math.PI * 2 * index) / segments - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const yy = cy + Math.sin(angle) * radius;
      const covered = index < Math.round((Math.max(0, Math.min(100, percent)) / 100) * segments);
      doc.setFillColor(...(covered ? BRAND.green : BRAND.orangePale));
      doc.circle(x, yy, dotRadius, "F");
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND.navy);
    doc.text(`${Math.round(percent)}%`, cx, cy + 0.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.4);
    doc.setTextColor(...BRAND.muted);
    doc.text("covered", cx, cy + 3.2, { align: "center" });
  };

  const drawCoverChart = () => {
    sectionHeading(
      "CHART",
      kind === "personal" ? "Your life cover picture" : "Your business protection picture",
      kind === "personal"
        ? "Compare the estimated amount your family may need with the life cover you already have."
        : "A visual comparison of the debt and ongoing overhead figures you shared.",
    );

    if (kind === "personal") {
      const need = amountFromText(figureByPrefix(analysis, "Indicative life cover need")?.value);
      const cover = amountFromText(figureByPrefix(analysis, "Existing life cover")?.value);
      const debt = amountFromText(figureByPrefix(analysis, "Debts to settle")?.value);
      const incomeNeed = Math.max(0, need - debt);
      const maximum = Math.max(need, cover, 1);
      const labelWidth = 43;
      const plotX = margin + labelWidth;
      const plotWidth = 70;
      const donutX = pageWidth - margin - 12;
      const valueRight = donutX - 11;
      const rows = [
        { label: "Your family may need", value: need, top: true },
        { label: "Cover you already have", value: cover, top: false },
      ];
      const firstRowY = y + 2;

      rows.forEach((row, index) => {
        const rowY = firstRowY + index * 14;
        const labelLines = doc.splitTextToSize(row.label, labelWidth - 4) as string[];
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.1);
        doc.setTextColor(...BRAND.ink);
        doc.text(labelLines, margin, rowY + (labelLines.length > 1 ? 1 : 3.2));

        doc.setFillColor(...BRAND.pale);
        doc.roundedRect(plotX, rowY, plotWidth, 5.5, 1.5, 1.5, "F");
        if (row.top && need > 0) {
          const debtWidth = Math.min(plotWidth, (debt / maximum) * plotWidth);
          const incomeWidth = Math.max(0, (incomeNeed / maximum) * plotWidth);
          if (debtWidth > 0) {
            doc.setFillColor(...BRAND.orange);
            doc.rect(plotX, rowY, debtWidth, 5.5, "F");
          }
          if (incomeWidth > 0) {
            doc.setFillColor(...BRAND.navy);
            doc.rect(plotX + debtWidth, rowY, Math.min(incomeWidth, plotWidth - debtWidth), 5.5, "F");
          }
        } else if (!row.top && cover > 0) {
          const coverWidth = Math.min(plotWidth, (cover / maximum) * plotWidth);
          doc.setFillColor(...BRAND.green);
          doc.roundedRect(plotX, rowY, coverWidth, 5.5, 1.4, 1.4, "F");
          if (cover < maximum) {
            doc.setFillColor(...BRAND.orangePale);
            doc.setDrawColor(...BRAND.orange);
            doc.setLineWidth(0.3);
            doc.rect(plotX + coverWidth, rowY + 0.4, plotWidth - coverWidth, 4.7, "FD");
          }
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.1);
        doc.setTextColor(...BRAND.navy);
        doc.text(compactMoney(row.value), valueRight, rowY + 4.2, { align: "right" });
      });

      const ticksY = firstRowY + 31;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.7);
      doc.setTextColor(...BRAND.muted);
      for (let index = 0; index <= 4; index += 1) {
        const amount = maximum * index / 4;
        const x = plotX + plotWidth * index / 4;
        doc.setDrawColor(...BRAND.line);
        doc.setLineWidth(0.25);
        doc.line(x, firstRowY - 1, x, firstRowY + 25);
        doc.text(index === 0 ? "R 0" : compactMoney(amount), x, ticksY, { align: "center" });
      }
      drawDonut(donutX, firstRowY + 10, need > 0 ? (cover / need) * 100 : 0);

      let legendX = margin + 1;
      const legendY = firstRowY + 43;
      legendX = drawLegendItem(legendX, legendY, BRAND.orange, "Debts");
      legendX = drawLegendItem(legendX, legendY, BRAND.navy, "Income replacement");
      legendX = drawLegendItem(legendX, legendY, BRAND.green, "Existing cover");
      drawLegendItem(legendX, legendY, BRAND.orange, "Shortfall", true);
      y = legendY + 5;
    } else {
      const chartRows = [
        { label: "Business debt to protect", value: amountFromText(figureByPrefix(analysis, "Business debt to protect")?.value), color: BRAND.navy },
        { label: "Six months of fixed overheads", value: amountFromText(figureByPrefix(analysis, "Six months of fixed overheads")?.value), color: BRAND.green },
        { label: "Twelve months of fixed overheads", value: amountFromText(figureByPrefix(analysis, "Twelve months of fixed overheads")?.value), color: BRAND.orange },
      ].filter((row) => row.value > 0);
      if (!chartRows.length) {
        paragraph("There are no monetary figures to chart from the answers provided.", { size: 8, color: BRAND.muted, gap: 4 });
      } else {
        const maximum = Math.max(...chartRows.map((row) => row.value));
        const labelWidth = 52;
        const plotX = margin + labelWidth;
        const plotWidth = contentWidth - labelWidth - 24;
        chartRows.forEach((row) => {
          const lines = doc.splitTextToSize(row.label, labelWidth - 4) as string[];
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.1);
          doc.setTextColor(...BRAND.ink);
          doc.text(lines, margin, y + 2.5);
          doc.setFillColor(...BRAND.pale);
          doc.roundedRect(plotX, y, plotWidth, 5.5, 1.5, 1.5, "F");
          doc.setFillColor(...row.color);
          doc.roundedRect(plotX, y, Math.max(1, row.value / maximum * plotWidth), 5.5, 1.5, 1.5, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.1);
          doc.setTextColor(...BRAND.navy);
          doc.text(compactMoney(row.value), pageWidth - margin, y + 4.2, { align: "right" });
          y += 12;
        });
      }
      y += 3;
    }

    paragraph(analysis.figureNote, { size: 7.2, color: BRAND.muted, gap: 2, lineHeight: 3.5 });
  };

  const drawObjectiveCard = (objective: ToolkitAnalysis["objectives"][number], index: number) => {
    const bodyX = margin + 20;
    const bodyWidth = contentWidth - 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.4);
    const titleLines = doc.splitTextToSize(objective.title, bodyWidth) as string[];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.7);
    const descriptionLines = doc.splitTextToSize(objective.description, bodyWidth) as string[];
    const markerHeight = 3.2;
    const titleHeight = titleLines.length * 4.1;
    const descriptionHeight = descriptionLines.length * 3.5;
    const cardHeight = Math.max(19, 5 + markerHeight + 1 + titleHeight + 1 + descriptionHeight + 4);
    ensureSpace(cardHeight + 2.2);

    const highlighted = objective.top;
    doc.setFillColor(...(highlighted ? BRAND.orangePale : BRAND.white));
    doc.setDrawColor(...(highlighted ? BRAND.orange : BRAND.line));
    doc.setLineWidth(highlighted ? 0.45 : 0.25);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 2.2, 2.2, "FD");
    doc.setFillColor(...(highlighted ? BRAND.orange : BRAND.greenPale));
    doc.circle(margin + 8.5, y + cardHeight / 2, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.6);
    doc.setTextColor(...(highlighted ? BRAND.white : BRAND.green));
    doc.text(String(index + 1), margin + 8.5, y + cardHeight / 2 + 1.1, { align: "center" });

    const marker = highlighted ? "YOUR TOP PRIORITY" : objective.identified ? "IDENTIFIED FROM YOUR ANSWERS" : "YOUR SELECTION";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(...(highlighted ? BRAND.orange : BRAND.muted));
    doc.text(marker, bodyX, y + 5.2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.4);
    doc.setTextColor(...BRAND.ink);
    doc.text(titleLines, bodyX, y + 9.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.7);
    doc.setTextColor(...BRAND.muted);
    doc.text(descriptionLines, bodyX, y + 9.5 + titleHeight + 0.8);
    y += cardHeight + 2.2;
  };

  const drawFiguresTable = () => {
    if (!analysis.figures.length) return;
    sectionHeading("INDICATIVE FIGURES", analysis.figureTitle);
    analysis.figures.forEach((figure) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const labelLines = doc.splitTextToSize(figure.label, contentWidth - 46) as string[];
      const rowHeight = Math.max(7.5, labelLines.length * 3.6 + 3);
      ensureSpace(rowHeight);
      if (figure.total) {
        doc.setFillColor(...BRAND.orangePale);
        doc.rect(margin, y, contentWidth, rowHeight, "F");
      }
      doc.setDrawColor(...BRAND.line);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      doc.setFont("helvetica", figure.total ? "bold" : "normal");
      doc.setFontSize(8);
      doc.setTextColor(...(figure.total ? BRAND.navy : BRAND.muted));
      doc.text(labelLines, margin + 2, y + 4.5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.3);
      doc.setTextColor(...BRAND.ink);
      doc.text(money(figure.value), pageWidth - margin - 2, y + 4.5, { align: "right" });
      y += rowHeight;
    });
    y += 2;
  };

  const drawProtectionRow = (check: ProtectionCheck) => {
    const pillWidth = check.status === "Partly covered" ? 30 : 23;
    const textX = margin + 11;
    const textWidth = contentWidth - 17 - pillWidth - 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.2);
    const titleLines = doc.splitTextToSize(check.label, textWidth) as string[];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.1);
    const descriptionLines = doc.splitTextToSize(check.description, textWidth) as string[];
    const rowHeight = Math.max(15, 4 + titleLines.length * 3.7 + descriptionLines.length * 3.35 + 3);
    ensureSpace(rowHeight + 1.7);
    doc.setFillColor(...BRAND.white);
    doc.setDrawColor(...BRAND.line);
    doc.setLineWidth(0.25);
    doc.roundedRect(margin, y, contentWidth, rowHeight, 2, 2, "FD");
    doc.setFillColor(...getStatusColor(check.status));
    doc.circle(margin + 5.2, y + rowHeight / 2, 1.8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.2);
    doc.setTextColor(...BRAND.ink);
    doc.text(titleLines, textX, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.1);
    doc.setTextColor(...BRAND.muted);
    doc.text(descriptionLines, textX, y + 5.5 + titleLines.length * 3.7);

    const pillX = pageWidth - margin - pillWidth - 3;
    const pillY = y + (rowHeight - 7) / 2;
    doc.setFillColor(...getStatusPale(check.status));
    doc.roundedRect(pillX, pillY, pillWidth, 7, 3.5, 3.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(...getStatusColor(check.status));
    doc.text(check.status, pillX + pillWidth / 2, pillY + 4.6, { align: "center" });
    y += rowHeight + 1.7;
  };

  const drawProtectionCheck = () => {
    const checks = kind === "personal"
      ? personalProtectionChecks(answers, analysis)
      : businessProtectionChecks(answers);
    sectionHeading(
      "SCORECARD",
      kind === "personal" ? "Your protection check" : "Your business protection check",
      "A quick discussion guide based on your answers.",
    );
    const reviewCount = checks.filter((check) => check.status === "Partly covered").length;
    const gapCount = checks.filter((check) => check.status === "Gap").length;
    const discussCount = checks.filter((check) => check.status === "Discuss").length;
    const segmentGap = 1.2;
    const segmentWidth = (contentWidth - segmentGap * (checks.length - 1)) / checks.length;
    checks.forEach((check, index) => {
      doc.setFillColor(...getStatusColor(check.status));
      doc.roundedRect(
        margin + index * (segmentWidth + segmentGap),
        y,
        segmentWidth,
        3,
        1.5,
        1.5,
        "F",
      );
    });
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.muted);
    doc.text(`${reviewCount} to review   |   ${gapCount} gaps   |   ${discussCount} to discuss`, margin, y);
    y += 5;

    const firstGroup = checks.slice(0, 3);
    const remaining = checks.slice(3);
    firstGroup.forEach(drawProtectionRow);
    if (remaining.length) {
      addPage(true);
      sectionHeading("SCORECARD", "Your protection check (continued)");
      remaining.forEach(drawProtectionRow);
    }
  };

  const drawAnswerProfile = () => {
    if (!answerSections.length) return;
    sectionHeading("PROFILE", "Your answers");
    const labelWidth = 68;
    const valueX = margin + labelWidth + 4;
    const valueWidth = contentWidth - labelWidth - 7;
    answerSections.forEach((section) => {
      ensureSpace(10);
      doc.setFillColor(...BRAND.green);
      doc.circle(margin + 1.6, y + 1.5, 1.2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.4);
      doc.setTextColor(...BRAND.green);
      doc.text(section.title, margin + 5, y + 2.8);
      y += 5.5;

      section.rows.forEach((row, index) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        const labelLines = doc.splitTextToSize(row.label, labelWidth - 4) as string[];
        doc.setFont("helvetica", "bold");
        const valueLines = doc.splitTextToSize(row.value, valueWidth) as string[];
        const lineCount = Math.max(labelLines.length, valueLines.length);
        const rowHeight = Math.max(6.2, lineCount * 3.7 + 2);
        ensureSpace(rowHeight);
        if (index % 2 === 1) {
          doc.setFillColor(...BRAND.greenPale);
          doc.rect(margin, y, contentWidth, rowHeight, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...BRAND.muted);
        doc.text(labelLines, margin + 3, y + 4.2);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...BRAND.ink);
        doc.text(valueLines, valueX, y + 4.2);
        y += rowHeight;
      });
      y += 2.5;
    });
  };

  const drawNextSteps = () => {
    ensureSpace(54);
    sectionHeading("WHAT HAPPENS NOW", "Your next steps");
    const timeOfDay = submission.contactTime?.split(" (")[0]?.toLowerCase();
    const timeWindow = submission.contactTime?.match(/\(([^)]+)\)/)?.[1];
    const followUpTime = timeOfDay && timeOfDay !== "any time"
      ? ` in the ${timeOfDay}${timeWindow ? ` (${timeWindow})` : ""}`
      : "";
    const followUpCopy = submission.phone
      ? `A MyIFA adviser can follow up on ${submission.phone}${followUpTime}.`
      : "A MyIFA adviser can follow up using the contact details on your account.";
    const steps = [
      { heading: "Adviser call", copy: followUpCopy },
      { heading: "Needs analysis", copy: "Review your full circumstances and confirm the figures together." },
      { heading: "Your plan", copy: "Discuss suitable options for your needs, budget and timing." },
    ];
    const gap = 5;
    const cardWidth = (contentWidth - gap * 2) / 3;
    const startY = y + 1;
    const centerXs = steps.map((_, index) => margin + index * (cardWidth + gap) + cardWidth / 2);
    doc.setDrawColor(...BRAND.line);
    doc.setLineWidth(1);
    doc.line(centerXs[0], startY + 5, centerXs[2], startY + 5);
    steps.forEach((step, index) => {
      const cx = centerXs[index];
      doc.setFillColor(...(index === 0 ? BRAND.orange : BRAND.navy));
      doc.circle(cx, startY + 5, 4.2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.white);
      doc.text(String(index + 1), cx, startY + 6.1, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.1);
      doc.setTextColor(...BRAND.navy);
      doc.text(step.heading, cx, startY + 15, { align: "center" });
      const lines = doc.splitTextToSize(step.copy, cardWidth - 5) as string[];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.9);
      doc.setTextColor(...BRAND.muted);
      doc.text(lines, cx, startY + 20, { align: "center" });
    });
    y = startY + 34;
  };

  const drawPreparationList = () => {
    const items = kind === "personal"
      ? [
          "A current list of your debts and balances",
          "Details of your existing cover and policies",
          "Your monthly expenses and any planned changes",
        ]
      : [
          "Current business debt and any surety documents",
          "Ownership, buy-and-sell or succession agreements",
          "Monthly overheads and existing benefit schedules",
        ];
    const boxHeight = 30;
    ensureSpace(boxHeight + 5);
    doc.setFillColor(...BRAND.greenPale);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.2);
    doc.setTextColor(...BRAND.navy);
    doc.text("Have these ready for your conversation", margin + 6, y + 7);
    items.forEach((item, index) => {
      const rowY = y + 13 + index * 5.2;
      doc.setFillColor(...BRAND.green);
      doc.roundedRect(margin + 6, rowY - 2.5, 3.2, 3.2, 0.8, 0.8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(...BRAND.white);
      doc.text("✓", margin + 6.75, rowY - 0.1);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.setTextColor(...BRAND.ink);
      doc.text(item, margin + 12, rowY);
    });
    y += boxHeight + 5;
  };

  const drawAdviserBanner = () => {
    ensureSpace(27);
    const bannerHeight = 23;
    doc.setFillColor(...BRAND.navyDeep);
    doc.roundedRect(margin, y, contentWidth, bannerHeight, 2.5, 2.5, "F");
    doc.setFillColor(...BRAND.navy);
    doc.circle(pageWidth - margin - 9, y + bannerHeight / 2, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text("Talk to a MyIFA adviser", margin + 7, y + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.1);
    doc.setTextColor(220, 225, 233);
    doc.text("Use this report to start a conversation about your priorities and next steps.", margin + 7, y + 16);
    drawWordmark(pageWidth - margin - 31, y + 13, 9, true);
    y += bannerHeight + 6;
  };

  const drawImportantInformation = () => {
    sectionHeading("PLEASE READ", "Important information");
    const disclosures = [
      `This report is an indicative summary based on the answers provided in the ${getToolkitName(kind)}. It is for discussion and educational purposes only. It is not a financial needs analysis, product recommendation, quotation, offer of insurance or financial advice.`,
      "Figures use simplified assumptions and may not account for all assets, liabilities, inflation, investment growth, tax or changes in your circumstances. An adviser should verify the information and complete a full needs analysis before any decision is made.",
      "Insurance and investment products have terms, conditions, costs and exclusions. Any recommendation must be based on your needs and explained to you before you decide.",
      "MyIFA uses information submitted with your consent to review your financial objectives and contact you about them, subject to applicable privacy requirements.",
    ];
    disclosures.forEach((text) => {
      paragraph(text, { size: 7.1, color: BRAND.muted, gap: 1.5, lineHeight: 3.5 });
    });
  };

  doc.setProperties({
    title: `MyIFA ${getToolkitName(kind)} report`,
    subject: "Financial objectives report",
    author: "MyIFA",
    creator: "MyIFA Financial Toolkit",
  });

  drawCover();
  paragraph(`Dear ${firstName(submission.clientName)},`, {
    font: "times",
    size: 11.5,
    bold: true,
    color: BRAND.navy,
    gap: 1,
  });
  paragraph(
    `Thank you for completing the MyIFA ${getToolkitName(kind)}. This report brings together your answers, the financial objectives they point to and the figures behind them. Use it as the starting point for a conversation with an adviser.`,
    { size: 8, color: BRAND.muted, gap: 3, lineHeight: 3.7 },
  );
  drawSummaryCards();
  drawCoverChart();

  addPage(false);
  sectionHeading(
    "IN ORDER OF PRIORITY",
    "Your financial objectives",
    "Starting with what you said matters most. Objectives marked as identified from your answers are discussion points your answers raised.",
  );
  if (!analysis.objectives.length) {
    paragraph("No objectives were identified from the answers provided.", { size: 8, color: BRAND.muted });
  } else {
    analysis.objectives.forEach(drawObjectiveCard);
  }
  drawFiguresTable();
  drawProtectionCheck();
  drawAnswerProfile();
  drawNextSteps();
  drawPreparationList();
  drawAdviserBanner();
  drawImportantInformation();

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...BRAND.line);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.4);
    doc.setTextColor(...BRAND.muted);
    doc.text(`MyIFA Financial Services  |  ${getToolkitName(kind)}  |  For discussion only`, margin, pageHeight - 8);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  const safeName = submission.clientName.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  const parsedDate = new Date(submission.createdAt);
  const dateKey = Number.isNaN(parsedDate.getTime())
    ? "date-unavailable"
    : parsedDate.toISOString().slice(0, 10);
  doc.save(`MyIFA-${kind}-toolkit-${safeName || "client"}-${dateKey}.pdf`);
}
