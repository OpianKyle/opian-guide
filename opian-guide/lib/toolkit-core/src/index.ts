export type ToolkitKind = "personal" | "business";
export type ToolkitAnswer = string | number | boolean | string[];
export type ToolkitAnswers = Record<string, ToolkitAnswer>;

export interface ToolkitQuestion {
  id: string;
  label: string;
  kind: "choice" | "multi" | "money" | "number" | "text" | "consent";
  options?: string[];
  optionLabels?: Record<string, string>;
  required?: boolean;
  help?: string;
  min?: number;
  max?: number;
  visibleWhen?: (answers: ToolkitAnswers) => boolean;
}

export interface ToolkitStep {
  title: string;
  intro: string;
  fields: ToolkitQuestion[];
}

export interface ToolkitObjective {
  key: string;
  title: string;
  description: string;
  top: boolean;
  identified: boolean;
}

export interface ToolkitFigure {
  label: string;
  value: string;
  total?: boolean;
}

export interface ToolkitAnalysis {
  objectives: ToolkitObjective[];
  figures: ToolkitFigure[];
  figureTitle: string;
  figureNote: string;
}

export interface ToolkitAnswerRow {
  label: string;
  value: string;
}

export interface ToolkitAnswerSection {
  title: string;
  rows: ToolkitAnswerRow[];
}

const PERSONAL_GOALS: Record<string, string> = {
  death: "Provide for my family if I pass away",
  funeral: "Cover funeral costs for me and my family",
  income: "Keep an income if I can't work",
  illness: "Be covered if I get a serious illness",
  debt: "Make sure my debts are paid off",
  education: "Save for my children's education",
  emergency: "Build an emergency fund",
  retirement: "Plan for retirement",
  estate: "Leave an inheritance and plan my estate",
};

const BUSINESS_GOALS: Record<string, string> = {
  continuity: "Keep the business running if an owner dies",
  bsa: "Fund a buy-and-sell agreement between owners",
  keyperson: "Protect against losing a key person",
  loans: "Settle business loans and personal sureties",
  overheads: "Pay fixed overheads if an owner is disabled",
  staff: "Offer staff benefits (group life, funeral, retirement)",
  succession: "Plan owner retirement or succession",
  owners: "Protect owners' families personally",
};

const choice = (
  id: string,
  label: string,
  options: string[],
  required = false,
  help?: string,
  visibleWhen?: ToolkitQuestion["visibleWhen"],
): ToolkitQuestion => ({ id, label, kind: "choice", options, required, help, visibleWhen });

const money = (id: string, label: string, help?: string): ToolkitQuestion => ({
  id, label, kind: "money", help,
});

const PERSONAL_STEPS: ToolkitStep[] = [
  {
    title: "About you and your family",
    intro: "This helps us understand who relies on you financially.",
    fields: [
      choice("age", "Your age", ["18-29", "30-39", "40-49", "50-59", "60+"], true),
      choice("status", "Relationship status", ["Single", "Married / life partner", "Divorced", "Widowed"], true),
      choice("deps", "How many people depend on your income?", ["0", "1", "2", "3", "4 or more"], true, "Include children, a spouse who doesn't earn, parents or relatives you support."),
      { id: "youngest", label: "Age of your youngest dependant", kind: "number", min: 0, max: 99, help: "Leave blank if they are adults.", visibleWhen: (a) => !!a.deps && a.deps !== "0" },
    ],
  },
  {
    title: "Income and work",
    intro: "Your income is usually your biggest financial asset. Let's see how protected it is.",
    fields: [
      choice("work", "How do you earn an income?", ["Employed", "Self-employed", "Business owner", "Retired", "Not working at the moment"], true),
      money("income", "Monthly take-home income", "After tax and deductions. A rough figure is fine."),
      choice("medical", "Do you have medical aid or a hospital plan?", ["Yes", "No"]),
    ],
  },
  {
    title: "What you owe",
    intro: "Debts don't disappear when someone passes away. They are usually paid from your estate first.",
    fields: [
      money("bond", "Home loan (bond) balance", "Enter 0 if you rent or own your home outright."),
      money("otherDebt", "Other debts", "Vehicle finance, personal loans, credit cards and store accounts combined."),
    ],
  },
  {
    title: "Cover and plans you already have",
    intro: "Include cover through your employer or retirement fund as well as your own policies.",
    fields: [
      money("lifeCover", "Total life cover you already have", "Enter 0 if none or unsure."),
      choice("funeralCover", "Do you have funeral cover?", ["Yes", "No", "Not sure"]),
      choice("disCover", "Do you have disability or income protection cover?", ["Yes", "No", "Not sure"]),
      choice("savings", "How many months of expenses could your savings cover?", ["None", "Less than 3", "3 to 6", "More than 6"]),
      choice("will", "Do you have a valid, up-to-date will?", ["Yes", "No", "Needs updating"]),
    ],
  },
  {
    title: "What matters most to you",
    intro: "Select everything that applies. There are no wrong answers.",
    fields: [
      { id: "goals", label: "Which of these are important to you?", kind: "multi", options: Object.keys(PERSONAL_GOALS), optionLabels: PERSONAL_GOALS, required: true },
      { id: "top", label: "Which one matters most right now?", kind: "choice", required: true, options: [] },
      { id: "worry", label: "Is there anything that worries you about your finances? (optional)", kind: "text" },
    ],
  },
  {
    title: "Budget and timing",
    intro: "This helps your advisor suggest options that fit.",
    fields: [
      choice("budget", "Monthly amount you could set aside for protection and savings", ["Under R500", "R500 - R1 500", "R1 500 - R3 000", "R3 000 - R6 000", "Over R6 000", "Not sure"], true),
      choice("when", "When would you like a plan in place?", ["As soon as possible", "Within 3 months", "Within 6 months", "Just exploring"], true),
    ],
  },
];

const BUSINESS_STEPS: ToolkitStep[] = [
  {
    title: "About your business",
    intro: "The structure of your business affects which types of cover make sense.",
    fields: [
      choice("type", "Business structure", ["Sole proprietor", "Partnership", "(Pty) Ltd company", "Close corporation (CC)", "Other"], true),
      choice("years", "How long have you been trading?", ["Under 2 years", "2 - 5 years", "5 - 10 years", "Over 10 years"]),
      choice("turnover", "Annual turnover", ["Under R1 million", "R1m - R5m", "R5m - R20m", "Over R20m"]),
      choice("staff", "Number of employees", ["None", "1 - 5", "6 - 20", "21 - 50", "More than 50"]),
    ],
  },
  {
    title: "Owners and key people",
    intro: "Most small businesses depend heavily on a few people. Let's identify them.",
    fields: [
      choice("owners", "How many owners, partners or shareholders are there?", ["1", "2", "3", "4 or more"], true),
      choice("bsaExists", "Is there a signed buy-and-sell agreement between the owners?", ["Yes, and it is funded", "Yes, but it is not funded", "No", "Not sure"], false, undefined, (a) => !!a.owners && a.owners !== "1"),
      choice("keyRely", "Would revenue drop sharply if one key person were suddenly gone?", ["Yes, significantly", "Somewhat", "Not really"], true),
      choice("keyCount", "How many people would that apply to?", ["1", "2", "3", "4 or more"], false, undefined, (a) => !!a.keyRely && a.keyRely !== "Not really"),
    ],
  },
  {
    title: "Debts and sureties",
    intro: "Personal sureties can put owners' family assets at risk if business debt is called in.",
    fields: [
      money("loans", "Total business loans, overdrafts and asset finance", "Enter 0 if none."),
      choice("surety", "Has any owner signed personal surety for business debt?", ["Yes", "No", "Not sure"]),
      money("overheads", "Monthly fixed overheads", "Rent, salaries, loan repayments and other costs that continue regardless of sales."),
    ],
  },
  {
    title: "Staff and benefits",
    intro: "Benefits help you attract and keep good people.",
    fields: [
      choice("benefits", "Do you offer staff group life, funeral or retirement benefits?", ["Yes", "No", "Some, but not all"], false, undefined, (a) => !!a.staff && a.staff !== "None"),
      choice("ownerCover", "Do the owners have their own personal life and disability cover?", ["Yes, all of them", "Some of them", "No", "Not sure"]),
    ],
  },
  {
    title: "Your business goals",
    intro: "Select everything that applies.",
    fields: [
      { id: "goals", label: "Which of these are important to you?", kind: "multi", options: Object.keys(BUSINESS_GOALS), optionLabels: BUSINESS_GOALS, required: true },
      { id: "top", label: "Which one matters most right now?", kind: "choice", required: true, options: [] },
      { id: "worry", label: "What is your biggest concern about the future of the business? (optional)", kind: "text" },
    ],
  },
  {
    title: "Budget and timing",
    intro: "This helps your advisor understand your preferred timing.",
    fields: [
      choice("budget", "Monthly budget the business could allocate to risk cover", ["Under R1 000", "R1 000 - R3 000", "R3 000 - R10 000", "Over R10 000", "Not sure"], true),
      choice("when", "When would you like a plan in place?", ["As soon as possible", "Within 3 months", "Within 6 months", "Just exploring"], true),
    ],
  },
];

const CONTACT_STEP_PERSONAL: ToolkitStep = {
  title: "Your contact details",
  intro: "Your account name and email will be shared with OPIAN Life so an advisor can follow up.",
  fields: [
    { id: "phone", label: "South African cellphone number", kind: "text", required: true, help: "For example, 082 123 4567." },
    choice("contactTime", "Best time to contact you", ["Morning (08:00-12:00)", "Afternoon (12:00-17:00)", "Any time"]),
    { id: "consent", label: "I agree that OPIAN Life may receive and use my toolkit answers to contact me about my financial objectives, in line with POPIA.", kind: "consent", required: true },
  ],
};

const CONTACT_STEP_BUSINESS: ToolkitStep = {
  title: "Your contact details",
  intro: "Your account name and email will be shared with OPIAN Life so an advisor can follow up.",
  fields: [
    { id: "businessName", label: "Business name", kind: "text", required: true },
    { id: "phone", label: "South African cellphone number", kind: "text", required: true, help: "For example, 082 123 4567." },
    choice("contactTime", "Best time to contact you", ["Morning (08:00-12:00)", "Afternoon (12:00-17:00)", "Any time"]),
    { id: "consent", label: "I agree that OPIAN Life may receive and use my toolkit answers to contact me about my financial objectives, in line with POPIA.", kind: "consent", required: true },
  ],
};

export function getToolkitSteps(kind: ToolkitKind): ToolkitStep[] {
  return [
    ...(kind === "business" ? BUSINESS_STEPS : PERSONAL_STEPS),
    kind === "business" ? CONTACT_STEP_BUSINESS : CONTACT_STEP_PERSONAL,
  ];
}

export function getToolkitName(kind: ToolkitKind): string {
  return kind === "business" ? "Business Toolkit" : "Personal Toolkit";
}

export function getGoalLabel(kind: ToolkitKind, key: string): string {
  const goals = kind === "business" ? BUSINESS_GOALS : PERSONAL_GOALS;
  return goals[key] ?? key;
}

export function getQuestionOptions(question: ToolkitQuestion, answers: ToolkitAnswers): string[] {
  if (question.id === "top") {
    const selected = Array.isArray(answers.goals) ? answers.goals : [];
    return selected.map(String);
  }
  return question.options ?? [];
}

export function getToolkitOptionLabel(
  kind: ToolkitKind,
  question: ToolkitQuestion,
  option: string,
): string {
  return question.optionLabels?.[option] ?? (question.id === "top" ? getGoalLabel(kind, option) : option);
}

export function validateToolkitAnswers(kind: ToolkitKind, raw: unknown): ToolkitAnswers {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Please complete the toolkit answers.");
  }

  const rawAnswers = raw as Record<string, unknown>;
  if (JSON.stringify(rawAnswers).length > 40_000) {
    throw new Error("The toolkit answers are too large.");
  }

  const fields = getToolkitSteps(kind).flatMap((step) => step.fields);
  const result: ToolkitAnswers = {};
  const goals = kind === "business" ? BUSINESS_GOALS : PERSONAL_GOALS;

  for (const field of fields) {
    if (field.visibleWhen && !field.visibleWhen(result)) continue;
    const value = rawAnswers[field.id];
    const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
    if (empty) {
      if (field.required) throw new Error(`Please answer: ${field.label}`);
      continue;
    }

    switch (field.kind) {
      case "choice": {
        const options = field.id === "top"
          ? (Array.isArray(result.goals) ? result.goals.map(String) : [])
          : field.options ?? [];
        if (typeof value !== "string" || !options.includes(value)) {
          throw new Error(`Choose a valid answer for: ${field.label}`);
        }
        result[field.id] = value;
        break;
      }
      case "multi": {
        if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
          throw new Error(`Choose valid answers for: ${field.label}`);
        }
        const selected = [...new Set(value as string[])].filter((key) => Object.hasOwn(goals, key));
        if (selected.length !== value.length) throw new Error(`Choose valid answers for: ${field.label}`);
        result[field.id] = selected;
        break;
      }
      case "money": {
        if (typeof value !== "string" && typeof value !== "number") throw new Error(`Enter a valid amount for: ${field.label}`);
        const amountText = String(value).trim().replace(/[Rr\s,]/g, "");
        if (!/^\d+(?:\.\d{1,2})?$/.test(amountText)) {
          throw new Error(`Enter a non-negative amount for: ${field.label}`);
        }
        const amount = Number(amountText);
        if (!Number.isFinite(amount) || amount > 99_999_999_999) {
          throw new Error(`Enter a smaller amount for: ${field.label}`);
        }
        result[field.id] = Math.round(amount);
        break;
      }
      case "number": {
        const number = Number(value);
        if (!Number.isInteger(number) || number < (field.min ?? 0) || number > (field.max ?? 99)) {
          throw new Error(`Enter a valid number for: ${field.label}`);
        }
        result[field.id] = number;
        break;
      }
      case "text": {
        if (typeof value !== "string") throw new Error(`Enter a valid answer for: ${field.label}`);
        const text = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
        if (field.required && !text) throw new Error(`Please answer: ${field.label}`);
        if (field.id === "phone") {
          const normalizedPhone = text.replace(/[\s()-]/g, "");
          if (!/^(\+27|0)\d{9}$/.test(normalizedPhone)) {
            throw new Error("Please enter a valid South African cellphone number.");
          }
          result.phone = text.slice(0, 30);
        } else if (field.id === "businessName") {
          if (!/^[\p{L}\p{M}\p{N}&'’.,()\- ]+$/u.test(text)) {
            throw new Error("Please enter a business name without special characters.");
          }
          result.businessName = text.slice(0, 80);
        } else {
          result[field.id] = text.slice(0, 500);
        }
        break;
      }
      case "consent": {
        if (value !== true) throw new Error("Consent is required to submit your toolkit.");
        result[field.id] = true;
        break;
      }
    }
  }

  if (kind === "business" && !result.businessName) throw new Error("Please enter your business name.");
  const normalizedPhone = String(result.phone ?? "").replace(/[\s()-]/g, "");
  if (!/^(\+27|0)\d{9}$/.test(normalizedPhone)) throw new Error("Please enter a valid South African cellphone number.");
  if (result.consent !== true) throw new Error("Consent is required to submit your toolkit.");

  return result;
}

const numberAnswer = (answers: ToolkitAnswers, key: string): number => {
  const value = answers[key];
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const goalOrder = (answers: ToolkitAnswers): string[] => {
  const selected = Array.isArray(answers.goals) ? answers.goals.map(String) : [];
  const top = typeof answers.top === "string" ? answers.top : selected[0];
  return [...new Set([top, ...selected].filter(Boolean))];
};

const moneyLabel = (value: number): string =>
  `R ${Math.round(value).toLocaleString("en-ZA").replace(/\u00a0/g, " ")}`;

export function calculateToolkit(kind: ToolkitKind, answers: ToolkitAnswers): ToolkitAnalysis {
  const selectedGoals = Array.isArray(answers.goals) ? answers.goals.map(String) : [];
  const order = goalOrder(answers);
  const objectives: ToolkitObjective[] = [];
  const figures: ToolkitFigure[] = [];

  if (kind === "business") {
    const loans = numberAnswer(answers, "loans");
    const overheads = numberAnswer(answers, "overheads");
    const multiOwner = !!answers.owners && answers.owners !== "1";
    const keyCount = String(answers.keyCount ?? "");
    const descriptions: Record<string, [string, string]> = {
      continuity: [
        "Keep the business running if an owner dies",
        answers.type === "Sole proprietor"
          ? "As a sole proprietor the business forms part of your personal estate. Plan who will run or sell it, and how it will be funded."
          : "Plan how ownership and control pass on, and make sure there is cash to keep trading through the change.",
      ],
      bsa: [
        "Fund a buy-and-sell agreement",
        multiOwner
          ? answers.bsaExists === "Yes, and it is funded"
            ? "You have a funded agreement. Check that cover still matches each owner's share at today's business value."
            : answers.bsaExists === "Yes, but it is not funded"
              ? "Your agreement isn't funded. Without cover, the remaining owners may not have the cash to buy the deceased owner's share."
              : "A buy-and-sell agreement backed by life cover lets the remaining owners buy a deceased owner's share at a fair price, and pays the family in cash."
          : "Buy-and-sell agreements apply when a business has more than one owner.",
      ],
      keyperson: [
        "Protect against losing a key person",
        `Key person cover pays the business a lump sum to replace lost profit and recruit a replacement${keyCount ? ` for the ${keyCount} ${keyCount === "1" ? "person" : "people"} you identified` : ""}.`,
      ],
      loans: [
        "Settle business loans and personal sureties",
        `${loans ? `The business owes about ${moneyLabel(loans)}. ` : ""}${answers.surety === "Yes" ? "An owner has signed personal surety, so the lender can claim from that owner's estate. Contingent liability cover settles the debt instead." : "Cover can settle business debt so lenders don't call up loans when an owner dies."}`,
      ],
      overheads: [
        "Pay fixed overheads during an owner's disability",
        `Business overhead cover pays fixed costs while an owner recovers${overheads ? ` (about ${moneyLabel(overheads)} a month)` : ""}, so the business is still there when they return.`,
      ],
      staff: [
        "Offer staff benefits",
        answers.benefits === "Yes" ? "You already offer benefits. Review whether they are competitive and cost-effective." : "Group life, funeral and retirement benefits help you attract and keep good people.",
      ],
      succession: [
        "Plan owner retirement and succession",
        "Decide who will take over or buy the business, how it will be valued, and how owners will fund their retirement.",
      ],
      owners: [
        "Protect owners' families personally",
        "Business cover protects the company. Each owner also needs personal life and disability cover for their own family.",
      ],
    };

    if (multiOwner && answers.bsaExists !== "Yes, and it is funded" && !order.includes("bsa")) order.push("bsa");
    if (answers.keyRely === "Yes, significantly" && !order.includes("keyperson")) order.push("keyperson");
    if (answers.surety === "Yes" && !order.includes("loans")) order.push("loans");
    if (["No", "Some of them"].includes(String(answers.ownerCover)) && !order.includes("owners")) order.push("owners");

    order.forEach((key, index) => {
      const item = descriptions[key];
      if (!item) return;
      objectives.push({
        key,
        title: item[0],
        description: item[1],
        top: index === 0,
        identified: !selectedGoals.includes(key),
      });
    });
    if (loans) figures.push({ label: "Business debt to protect", value: moneyLabel(loans) });
    if (overheads) {
      figures.push({ label: "Six months of fixed overheads", value: moneyLabel(overheads * 6) });
      figures.push({ label: "Twelve months of fixed overheads", value: moneyLabel(overheads * 12), total: true });
    }
    return {
      objectives,
      figures,
      figureTitle: "Key figures",
      figureNote: "Key person and overhead cover are usually based on months of overheads or lost gross profit. Your advisor will confirm the right basis for your business.",
    };
  }

  const income = numberAnswer(answers, "income");
  const bond = numberAnswer(answers, "bond");
  const otherDebt = numberAnswer(answers, "otherDebt");
  const cover = numberAnswer(answers, "lifeCover");
  const dependantValue = String(answers.deps ?? "0");
  const dependants = dependantValue === "4 or more" ? 4 : Number(dependantValue) || 0;
  const youngestAge = answers.youngest === undefined ? Number.NaN : Number(answers.youngest);
  const years = dependants > 0
    ? Number.isNaN(youngestAge) ? 10 : Math.min(20, Math.max(5, 21 - youngestAge))
    : 0;
  const incomeNeed = income * 12 * years * 0.75;
  const need = bond + otherDebt + incomeNeed;
  const gap = Math.max(0, need - cover);
  const descriptions: Record<string, [string, string]> = {
    death: [
      "Provide for your family if you pass away",
      dependants > 0
        ? `${dependants} ${dependants === 1 ? "person depends" : "people depend"} on your income. An indicative ${moneyLabel(need)} would settle your debts and replace most of your income for about ${years} years${cover ? `, and you already have ${moneyLabel(cover)}.` : "."}`
        : "Make sure your debts and final expenses are covered so nothing passes to family members.",
    ],
    funeral: [
      "Cover funeral costs",
      answers.funeralCover === "Yes" ? "You have funeral cover. Check that the amount and family members covered are still right." : "A funeral policy pays out quickly, often within 48 hours, so your family isn't left raising money.",
    ],
    income: [
      "Protect your income if you can't work",
      `${answers.disCover === "Yes" ? "You have some disability cover. Confirm whether it pays a lump sum, a monthly income, or both." : "You don't have disability or income protection yet."}${income ? ` Your income of ${moneyLabel(income)} a month is what keeps every other plan going.` : ""}`,
    ],
    illness: [
      "Prepare for a serious illness",
      `Critical illness cover pays a lump sum on diagnosis to help with costs ${answers.medical === "No" ? "that would otherwise come from your savings. You also told us you have no medical aid or hospital plan." : "your medical aid may not cover, such as gap fees and lost income."}`,
    ],
    debt: [
      "Make sure your debts are paid off",
      bond + otherDebt ? `You owe about ${moneyLabel(bond + otherDebt)}. Cover that settles this protects your home and your family's credit.` : "Keep debt-free and make sure future loans are covered.",
    ],
    education: ["Save for your children's education", "A dedicated savings plan started early spreads the cost of school and university fees over time."],
    emergency: [
      "Build an emergency fund",
      `Aim for three to six months of expenses${income ? ` (about ${moneyLabel(income * 3)} to ${moneyLabel(income * 6)})` : ""}.${answers.savings ? ` You told us your savings would cover: ${String(answers.savings).toLowerCase()}${answers.savings === "None" ? "." : " months."}` : ""}`,
    ],
    retirement: ["Plan for retirement", "Check whether you are on track to retire on a comfortable income, and use tax-efficient retirement savings."],
    estate: ["Plan your estate and leave an inheritance", "Estate planning makes sure your assets go where you want, with enough cash in the estate for costs and taxes."],
  };

  if (dependants > 0 && gap > 0 && !order.includes("death")) order.push("death");
  if (answers.funeralCover !== "Yes" && !order.includes("funeral")) order.push("funeral");
  if (answers.disCover !== "Yes" && ["Employed", "Self-employed", "Business owner"].includes(String(answers.work)) && !order.includes("income")) order.push("income");
  order.forEach((key, index) => {
    const item = descriptions[key];
    if (!item) return;
    objectives.push({ key, title: item[0], description: item[1], top: index === 0, identified: !selectedGoals.includes(key) });
  });
  if (answers.will !== "Yes") {
    objectives.push({
      key: "will",
      title: "Draw up or update your will",
      description: "Without a valid will your estate is divided according to the Intestate Succession Act, which may not match your wishes.",
      top: false,
      identified: true,
    });
  }

  if (bond + otherDebt) figures.push({ label: "Debts to settle", value: moneyLabel(bond + otherDebt) });
  if (incomeNeed) figures.push({ label: `Income replacement (${years} years at 75% of take-home)`, value: moneyLabel(incomeNeed) });
  figures.push({ label: "Indicative life cover need", value: moneyLabel(need) });
  figures.push({ label: "Existing life cover", value: moneyLabel(cover) });
  figures.push({ label: "Indicative shortfall", value: moneyLabel(gap), total: true });
  return {
    objectives,
    figures,
    figureTitle: "Indicative life cover",
    figureNote: "A simple estimate that ignores investment growth, inflation and assets you own. Your advisor will refine it in a full needs analysis.",
  };
}

export function getToolkitAnswerSections(kind: ToolkitKind, answers: ToolkitAnswers): ToolkitAnswerSection[] {
  const goals = kind === "business" ? BUSINESS_GOALS : PERSONAL_GOALS;
  const steps = getToolkitSteps(kind);
  const sections: ToolkitAnswerSection[] = [];
  for (const step of steps) {
    const rows: ToolkitAnswerRow[] = [];
    for (const field of step.fields) {
      if (field.visibleWhen && !field.visibleWhen(answers)) continue;
      const answer = answers[field.id];
      if (answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0)) continue;
      let value = "";
      if (Array.isArray(answer)) value = answer.map((key) => goals[String(key)] ?? String(key)).join(", ");
      else if (typeof answer === "boolean") value = answer ? "Yes" : "No";
      else if (field.kind === "money") value = moneyLabel(Number(answer) || 0);
      else if (field.id === "top") value = goals[String(answer)] ?? String(answer);
      else value = String(answer);
      rows.push({ label: field.label, value });
    }
    if (rows.length) sections.push({ title: step.title, rows });
  }
  return sections;
}
