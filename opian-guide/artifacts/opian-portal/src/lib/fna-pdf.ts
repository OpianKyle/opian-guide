import type { jsPDF as JsPdfDocument } from "jspdf";

export interface FnaData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  smoker: string;
  maritalStatus: string;
  dependants: number;
  currentAge: number;
  grossMonthlyIncome: number;
  netMonthlyIncome: number;
  spouseIncome: number;
  employmentType: string;
  occupation: string;
  hasGroupBenefits: string;
  monthlyExpenses: number;
  homeLoans: number;
  vehicleFinance: number;
  personalLoans: number;
  creditCards: number;
  otherDebts: number;
  savings: number;
  investments: number;
  retirementFunds: number;
  propertyValue: number;
  existingLifeCover: number;
  existingDisabilityCover: number;
  existingDreadDiseaseCover: number;
  targetRetirementAge: number;
  monthlyRetirementIncome: number;
  currentRetirementSavings: number;
  monthlyInvestmentBudget: number;
  investmentGoal: string;
  riskProfile: string;
  investmentHorizon: number;
  priorities: string[];
  notes: string;
}

type PdfRow = {
  label: string;
  value: string;
  choices?: string[];
  fullWidth?: boolean;
  blankLines?: number;
};

type PdfSection = {
  title: string;
  rows: PdfRow[];
};

const PRIORITIES: Record<string, string> = {
  "life-cover": "Life Cover",
  disability: "Disability Cover",
  "dread-disease": "Dread Disease",
  retirement: "Retirement",
  investments: "Investments",
  "medical-aid": "Medical Aid",
  "emergency-fund": "Emergency Fund",
  "estate-planning": "Estate Planning",
};

const money = (amount: number) =>
  `R ${Math.round(amount || 0).toLocaleString("en-ZA")}`;

const titleCase = (value: string) =>
  value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function sectionsFor(data: FnaData): PdfSection[] {
  return [
    {
      title: "1. Personal details",
      rows: [
        { label: "First name", value: data.firstName },
        { label: "Last name", value: data.lastName },
        { label: "Email address", value: data.email },
        { label: "Phone number", value: data.phone },
        { label: "Date of birth", value: data.dob },
        {
          label: "Gender",
          value: titleCase(data.gender),
          choices: ["Male", "Female"],
        },
        {
          label: "Smoker?",
          value: data.smoker === "yes" ? "Smoker" : data.smoker === "no" ? "Non-smoker" : "",
          choices: ["Non-smoker", "Smoker"],
        },
        {
          label: "Marital status",
          value: titleCase(data.maritalStatus),
          choices: ["Single", "Married", "Divorced", "Widowed"],
        },
        { label: "Financial dependants", value: String(data.dependants || 0) },
      ],
    },
    {
      title: "2. Income and employment",
      rows: [
        {
          label: "Employment type",
          value: titleCase(data.employmentType),
          choices: [
            "Employed (salary)",
            "Self-employed / freelance",
            "Business owner",
            "Contractor",
            "Retired",
            "Unemployed",
          ],
        },
        { label: "Occupation / job title", value: data.occupation },
        {
          label: "Group benefits through employer?",
          value: titleCase(data.hasGroupBenefits),
          choices: ["Yes", "No"],
        },
        { label: "Gross monthly income", value: money(data.grossMonthlyIncome) },
        { label: "Net monthly income", value: money(data.netMonthlyIncome) },
        { label: "Spouse / partner income", value: money(data.spouseIncome) },
      ],
    },
    {
      title: "3. Expenses and liabilities",
      rows: [
        { label: "Monthly household expenses", value: money(data.monthlyExpenses) },
        { label: "Home loans", value: money(data.homeLoans) },
        { label: "Vehicle finance", value: money(data.vehicleFinance) },
        { label: "Personal loans", value: money(data.personalLoans) },
        { label: "Credit cards", value: money(data.creditCards) },
        { label: "Other debts", value: money(data.otherDebts) },
      ],
    },
    {
      title: "4. Assets and existing cover",
      rows: [
        { label: "Savings / cash", value: money(data.savings) },
        { label: "Investments", value: money(data.investments) },
        { label: "Retirement funds / pension / RA", value: money(data.retirementFunds) },
        { label: "Property value", value: money(data.propertyValue) },
        { label: "Existing life cover", value: money(data.existingLifeCover) },
        { label: "Existing disability cover", value: money(data.existingDisabilityCover) },
        { label: "Existing dread disease cover", value: money(data.existingDreadDiseaseCover) },
      ],
    },
    {
      title: "5. Retirement planning",
      rows: [
        { label: "Current age", value: String(data.currentAge || 0) },
        { label: "Target retirement age", value: String(data.targetRetirementAge || 0) },
        { label: "Desired monthly retirement income", value: money(data.monthlyRetirementIncome) },
        { label: "Current retirement savings", value: money(data.currentRetirementSavings) },
      ],
    },
    {
      title: "6. Investment goals and risk profile",
      rows: [
        {
          label: "Primary investment goal",
          value: titleCase(data.investmentGoal),
          choices: [
            "Wealth growth",
            "Passive income",
            "Children's education",
            "Property purchase",
            "Emergency fund",
          ],
        },
        {
          label: "Risk appetite",
          value: titleCase(data.riskProfile),
          choices: ["Conservative", "Moderate", "Aggressive"],
        },
        { label: "Investment time horizon (years)", value: String(data.investmentHorizon || 0) },
        { label: "Monthly investment budget", value: money(data.monthlyInvestmentBudget) },
        {
          label: "Financial priorities",
          value: data.priorities.map((priority) => PRIORITIES[priority] || titleCase(priority)).join(", "),
          choices: Object.values(PRIORITIES),
        },
        { label: "Adviser notes", value: data.notes, fullWidth: true, blankLines: 4 },
      ],
    },
  ];
}

async function buildFnaPdf(data: FnaData, blank: boolean): Promise<JsPdfDocument> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const valueX = margin + 76;
  const valueWidth = pageWidth - margin - valueX;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 18;
  let y = 18;

  const addPageHeader = (continued: boolean) => {
    doc.setTextColor(27, 42, 74);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(continued ? 10 : 19);
    doc.text(
      continued ? "MyIFA | Financial Needs Analysis (continued)" : "MyIFA Financial Needs Analysis",
      margin,
      y,
    );
    y += continued ? 7 : 8;
    if (!continued) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 102, 122);
      doc.text(blank ? "Blank paper form" : "Filled form copy", margin, y);
      y += 6;
    }
    doc.setDrawColor(201, 165, 42);
    doc.setLineWidth(0.7);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;
  };

  const newPage = () => {
    doc.addPage();
    y = 15;
    addPageHeader(true);
  };

  const ensureSpace = (height: number) => {
    if (y + height > bottomLimit) newPage();
  };

  const addSection = (title: string) => {
    ensureSpace(13);
    doc.setFillColor(27, 42, 74);
    doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3, y + 5.4);
    y += 11;
  };

  const addRow = (row: PdfRow) => {
    if (row.fullWidth) {
      const labelLines = doc.splitTextToSize(row.label, contentWidth);
      const valueLines =
        blank || !row.value ? [] : doc.splitTextToSize(row.value, contentWidth);
      const lineCount = blank ? row.blankLines || 2 : Math.max(1, valueLines.length);
      const rowHeight = 6 + lineCount * 5;
      ensureSpace(rowHeight);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(27, 42, 74);
      doc.text(labelLines, margin, y);
      y += labelLines.length * 4 + 2;
      if (blank) {
        doc.setDrawColor(170, 178, 190);
        for (let line = 0; line < lineCount; line += 1) {
          doc.line(margin, y + line * 5, pageWidth - margin, y + line * 5);
        }
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(45, 52, 64);
        doc.text(valueLines.length ? valueLines : ["—"], margin, y);
      }
      y += lineCount * 5 + 2;
      return;
    }

    const labelLines = doc.splitTextToSize(row.label, 72);
    const valueText =
      blank && row.choices
        ? row.choices.map((choice) => `[ ] ${choice}`).join("   ")
        : row.value || (blank ? "" : "—");
    const valueLines = blank && !row.choices
      ? []
      : doc.splitTextToSize(valueText, valueWidth);
    const lineCount = Math.max(labelLines.length, valueLines.length, 1);
    const blankLineCount = blank ? row.blankLines || 1 : 0;
    const rowHeight = lineCount * 4.5 + blankLineCount * 5 + 3;
    ensureSpace(rowHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(27, 42, 74);
    doc.text(labelLines, margin, y);
    if (blank && !row.choices) {
      doc.setDrawColor(170, 178, 190);
      for (let line = 0; line < blankLineCount; line += 1) {
        doc.line(valueX, y + 1 + line * 5, pageWidth - margin, y + 1 + line * 5);
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(45, 52, 64);
      doc.text(valueLines, valueX, y);
    }
    y += rowHeight;
  };

  addPageHeader(false);

  if (!blank) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(45, 52, 64);
    doc.text(`Client: ${data.firstName} ${data.lastName}`.trim(), margin, y);
    doc.text(`Date: ${new Date().toLocaleDateString("en-ZA")}`, pageWidth - margin, y, {
      align: "right",
    });
    y += 7;
  }

  sectionsFor(data).forEach((section) => {
    addSection(section.title);
    section.rows.forEach(addRow);
    y += 2;
  });

  addSection("Acknowledgement and signatures");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(45, 52, 64);
  const acknowledgement =
    "By submitting, you authorise MyIFAPortal to contact this client regarding their financial needs.";
  const acknowledgementLines = doc.splitTextToSize(acknowledgement, contentWidth);
  ensureSpace(acknowledgementLines.length * 4 + 30);
  doc.text(acknowledgementLines, margin, y);
  y += acknowledgementLines.length * 4 + 8;

  const signatureLabels = ["Client signature", "Date", "Adviser signature", "Date"];
  signatureLabels.forEach((label, index) => {
    const x = index % 2 === 0 ? margin : pageWidth / 2 + 5;
    const width = pageWidth / 2 - margin - 5;
    if (index % 2 === 0 && index > 0) y += 11;
    doc.setFontSize(8);
    doc.setTextColor(90, 102, 122);
    doc.text(label, x, y);
    doc.setDrawColor(170, 178, 190);
    doc.line(x, y + 8, x + width, y + 8);
    if (index % 2 === 1) y += 13;
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(115, 123, 137);
    doc.text(
      `MyIFA Financial Needs Analysis  |  Page ${page} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" },
    );
  }

  return doc;
}

export async function downloadFnaPdf(data: FnaData, blank = false): Promise<void> {
  const doc = await buildFnaPdf(data, blank);
  const clientName = `${data.firstName}-${data.lastName}`
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
  doc.save(blank ? "MyIFA-FNA-Blank.pdf" : `MyIFA-FNA-${clientName || "Client"}.pdf`);
}

export async function openFnaPdfForPrint(data: FnaData, blank = false): Promise<boolean> {
  const printWindow = window.open("about:blank", "_blank");
  if (!printWindow) return false;

  try {
    const doc = await buildFnaPdf(data, blank);
    doc.autoPrint({ variant: "javascript" });
    printWindow.location.href = doc.output("bloburl");
    return true;
  } catch (error) {
    printWindow.close();
    throw error;
  }
}
