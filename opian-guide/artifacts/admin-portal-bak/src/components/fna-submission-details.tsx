import type { FnaSubmission } from "@workspace/api-client-react";

const NOT_PROVIDED = "Not provided";
const currencyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 2,
});

const PRIORITY_LABELS: Record<string, string> = {
  "life-cover": "Life Cover",
  disability: "Disability Cover",
  "dread-disease": "Dread Disease",
  retirement: "Retirement",
  investments: "Investments",
  "medical-aid": "Medical Aid",
  "emergency-fund": "Emergency Fund",
  "estate-planning": "Estate Planning",
};

type DetailField = { label: string; value: string; wide?: boolean };

function readable(value: string | null | undefined): string {
  if (!value?.trim()) return NOT_PROVIDED;
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function money(value: number): string {
  return Number.isFinite(value) ? currencyFormatter.format(value) : NOT_PROVIDED;
}

function number(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString("en-ZA") : NOT_PROVIDED;
}

function prioritiesText(serialized: string): string {
  if (!serialized.trim()) return NOT_PROVIDED;
  let values: string[] = [];
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (Array.isArray(parsed)) {
      values = parsed.filter((value): value is string => typeof value === "string");
    }
  } catch {
    values = serialized.split(",").map((value) => value.trim()).filter(Boolean);
  }
  if (!values.length) return serialized.trim() === "[]" ? "None selected" : NOT_PROVIDED;
  return values.map((value) => PRIORITY_LABELS[value] ?? readable(value)).join(", ");
}

function sectionsFor(submission: FnaSubmission) {
  return [
    {
      title: "Personal details",
      fields: [
        { label: "First name", value: submission.firstName || NOT_PROVIDED },
        { label: "Last name", value: submission.lastName || NOT_PROVIDED },
        { label: "Email address", value: submission.email || NOT_PROVIDED },
        { label: "Phone number", value: submission.phone || NOT_PROVIDED },
        { label: "Date of birth", value: submission.dob || NOT_PROVIDED },
        { label: "Current age", value: number(submission.currentAge) },
        { label: "Gender", value: readable(submission.gender) },
        { label: "Smoker", value: readable(submission.smoker) },
        { label: "Marital status", value: readable(submission.maritalStatus) },
        { label: "Financial dependants", value: number(submission.dependants) },
      ],
    },
    {
      title: "Income and employment",
      fields: [
        { label: "Gross monthly income", value: money(submission.grossMonthlyIncome) },
        { label: "Net monthly income", value: money(submission.netMonthlyIncome) },
        { label: "Spouse income", value: money(submission.spouseIncome) },
        { label: "Employment type", value: readable(submission.employmentType) },
        { label: "Occupation", value: submission.occupation.trim() || NOT_PROVIDED },
        { label: "Group benefits", value: readable(submission.hasGroupBenefits) },
      ],
    },
    {
      title: "Expenses and liabilities",
      fields: [
        { label: "Monthly expenses", value: money(submission.monthlyExpenses) },
        { label: "Home loans", value: money(submission.homeLoans) },
        { label: "Vehicle finance", value: money(submission.vehicleFinance) },
        { label: "Personal loans", value: money(submission.personalLoans) },
        { label: "Credit cards", value: money(submission.creditCards) },
        { label: "Other debts", value: money(submission.otherDebts) },
      ],
    },
    {
      title: "Assets and existing cover",
      fields: [
        { label: "Savings", value: money(submission.savings) },
        { label: "Investments", value: money(submission.investments) },
        { label: "Retirement funds", value: money(submission.retirementFunds) },
        { label: "Property value", value: money(submission.propertyValue) },
        { label: "Existing life cover", value: money(submission.existingLifeCover) },
        { label: "Existing disability cover", value: money(submission.existingDisabilityCover) },
        { label: "Existing dread disease cover", value: money(submission.existingDreadDiseaseCover) },
      ],
    },
    {
      title: "Retirement planning",
      fields: [
        { label: "Target retirement age", value: number(submission.targetRetirementAge) },
        { label: "Desired monthly retirement income", value: money(submission.monthlyRetirementIncome) },
        { label: "Current retirement savings", value: money(submission.currentRetirementSavings) },
      ],
    },
    {
      title: "Investment goals",
      fields: [
        { label: "Monthly investment budget", value: money(submission.monthlyInvestmentBudget) },
        { label: "Investment goal", value: submission.investmentGoal.trim() || NOT_PROVIDED },
        { label: "Risk profile", value: readable(submission.riskProfile) },
        { label: "Investment horizon", value: `${number(submission.investmentHorizon)} years` },
        { label: "Priorities", value: prioritiesText(submission.priorities), wide: true },
      ],
    },
    {
      title: "Additional notes",
      fields: [
        { label: "Notes", value: submission.notes?.trim() || NOT_PROVIDED, wide: true },
      ],
    },
  ] satisfies { title: string; fields: DetailField[] }[];
}

export function FnaSubmissionDetails({ submission }: { submission: FnaSubmission }) {
  return (
    <div className="space-y-4">
      {sectionsFor(submission).map((section) => (
        <section key={section.title} className="rounded-lg border bg-background p-4">
          <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.label} className={field.wide ? "sm:col-span-2" : undefined}>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="mt-1 break-words whitespace-pre-wrap text-sm text-foreground">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
