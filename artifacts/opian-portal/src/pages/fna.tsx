import { useState, useCallback } from "react";
import { useCreateFnaSubmission, getListFnaSubmissionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FnaData {
  // Step 1
  firstName: string; lastName: string; email: string; phone: string;
  dob: string; gender: string; smoker: string; maritalStatus: string;
  dependants: number; currentAge: number;
  // Step 2
  grossMonthlyIncome: number; netMonthlyIncome: number; spouseIncome: number;
  employmentType: string; occupation: string; hasGroupBenefits: string;
  // Step 3
  monthlyExpenses: number; homeLoans: number; vehicleFinance: number;
  personalLoans: number; creditCards: number; otherDebts: number;
  // Step 4
  savings: number; investments: number; retirementFunds: number;
  propertyValue: number; existingLifeCover: number;
  existingDisabilityCover: number; existingDreadDiseaseCover: number;
  // Step 5
  targetRetirementAge: number; monthlyRetirementIncome: number;
  currentRetirementSavings: number;
  // Step 6
  monthlyInvestmentBudget: number; investmentGoal: string;
  riskProfile: string; investmentHorizon: number; priorities: string[];
  // Meta
  notes: string;
}

const DEFAULTS: FnaData = {
  firstName: "", lastName: "", email: "", phone: "",
  dob: "", gender: "", smoker: "", maritalStatus: "",
  dependants: 0, currentAge: 0,
  grossMonthlyIncome: 0, netMonthlyIncome: 0, spouseIncome: 0,
  employmentType: "", occupation: "", hasGroupBenefits: "",
  monthlyExpenses: 0, homeLoans: 0, vehicleFinance: 0,
  personalLoans: 0, creditCards: 0, otherDebts: 0,
  savings: 0, investments: 0, retirementFunds: 0,
  propertyValue: 0, existingLifeCover: 0,
  existingDisabilityCover: 0, existingDreadDiseaseCover: 0,
  targetRetirementAge: 65, monthlyRetirementIncome: 0,
  currentRetirementSavings: 0,
  monthlyInvestmentBudget: 0, investmentGoal: "",
  riskProfile: "", investmentHorizon: 10, priorities: [],
  notes: "",
};

// ─── Calculations (mirrors the original site) ─────────────────────────────────
function calcFna(d: FnaData) {
  const totalDebt = d.homeLoans + d.vehicleFinance + d.personalLoans + d.creditCards + d.otherDebts;
  const totalAssets = d.savings + d.investments + d.retirementFunds + d.propertyValue;
  const netIncome = d.netMonthlyIncome || d.grossMonthlyIncome * 0.75;
  const monthlyShortfall = Math.max(0, netIncome - d.monthlyExpenses);
  const yearsMultiplier = d.dependants > 0 ? 15 : 10;
  const dependantNeed = d.dependants * 250000;
  const lifeCoverNeed = netIncome * 12 * yearsMultiplier + totalDebt + dependantNeed;
  const lifeCoverGap = Math.max(0, lifeCoverNeed - d.existingLifeCover);
  const yearsToRetirement = Math.max(1, d.targetRetirementAge - (d.currentAge || 35));
  const disabilityNeed = (d.grossMonthlyIncome || netIncome / 0.75) * 0.75 * 12 * yearsToRetirement;
  const disabilityGap = Math.max(0, disabilityNeed - d.existingDisabilityCover);
  const dreadDiseaseNeed = netIncome * 12 * 4 + 500000;
  const dreadDiseaseGap = Math.max(0, dreadDiseaseNeed - d.existingDreadDiseaseCover);
  const retirementCorpusNeeded = (d.monthlyRetirementIncome || netIncome * 0.75) * 12 / 0.06 * Math.pow(1.06, yearsToRetirement);
  const retirementSavingsFV = (d.currentRetirementSavings || d.retirementFunds) * Math.pow(1.1, yearsToRetirement);
  const retirementShortfall = Math.max(0, retirementCorpusNeeded - retirementSavingsFV);
  const monthlyRate = 0.10 / 12;
  const months = yearsToRetirement * 12;
  const monthlyContributionNeeded = retirementShortfall > 0 ? retirementShortfall * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1) : 0;
  const emergencyFundTarget = netIncome * 6;
  const emergencyFundGap = Math.max(0, emergencyFundTarget - d.savings);
  const smokerMult = d.smoker === "yes" ? 1.4 : 1;
  const genderMult = d.gender === "female" ? 0.85 : 1;
  const lifePremium = lifeCoverGap > 0 ? lifeCoverGap / 1000 * 1.2 * smokerMult * genderMult : 0;
  const disabilityPremium = disabilityGap > 0 ? netIncome * 0.75 * 0.035 : 0;
  const dreadPremium = dreadDiseaseGap > 0 ? dreadDiseaseGap / 1000 * 1.8 * smokerMult : 0;
  const totalRecommendedPremium = lifePremium + disabilityPremium + dreadPremium + monthlyContributionNeeded;
  const affordabilityRatio = netIncome > 0 ? totalRecommendedPremium / netIncome : 0;
  const netWorth = totalAssets - totalDebt;
  return {
    totalDebt, totalAssets, netIncome, monthlyShortfall, netWorth,
    lifeCoverNeed, lifeCoverGap, disabilityNeed, disabilityGap,
    dreadDiseaseNeed, dreadDiseaseGap, retirementCorpusNeeded,
    retirementShortfall, monthlyContributionNeeded,
    emergencyFundTarget, emergencyFundGap,
    lifePremium, disabilityPremium, dreadPremium,
    totalRecommendedPremium, affordabilityRatio, yearsToRetirement,
  };
}

const fmt = (n: number) => "R " + Math.round(n).toLocaleString("en-ZA");
const pct = (n: number) => (n * 100).toFixed(1) + "%";

// ─── Reusable Input / Select primitives ──────────────────────────────────────
function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">{label}</label>
      {help && <p className="text-xs text-[#718096] -mt-0.5 mb-0.5">{help}</p>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", prefix }: {
  value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string; prefix?: string;
}) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg bg-white focus-within:border-[#1B2A4A] transition-colors">
      {prefix && <span className="px-3 text-sm text-[#718096] border-r border-gray-200 py-3 bg-gray-50 rounded-l-lg">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-3 text-sm bg-transparent outline-none text-[#1B2A4A]"
      />
    </div>
  );
}

function SelectInput({ value, onChange, options, placeholder = "— Select —" }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-4 py-3 border border-gray-200 rounded-lg bg-white text-sm text-[#1B2A4A] outline-none focus:border-[#1B2A4A] transition-colors"
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function SectionCard({ title, subtitle, icon, children }: {
  title: string; subtitle?: string; icon: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-2">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-bold text-[#1B2A4A] text-lg">{title}</h3>
          {subtitle && <p className="text-sm text-[#718096]">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Steps config ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: "personal", label: "Personal\nDetails", icon: "👤" },
  { id: "income", label: "Income &\nEmployment", icon: "💼" },
  { id: "expenses", label: "Expenses &\nLiabilities", icon: "📊" },
  { id: "assets", label: "Assets &\nExisting Cover", icon: "🏦" },
  { id: "retirement", label: "Retirement\nPlanning", icon: "🎯" },
  { id: "investment", label: "Investment\nGoals", icon: "📈" },
  { id: "results", label: "Your FNA\nResults", icon: "✅" },
  { id: "submit", label: "Review &\nSubmit", icon: "🎉" },
];

const PRIORITY_OPTIONS = [
  { value: "life-cover", label: "Life Cover" },
  { value: "disability", label: "Disability Cover" },
  { value: "dread-disease", label: "Dread Disease" },
  { value: "retirement", label: "Retirement" },
  { value: "investments", label: "Investments" },
  { value: "medical-aid", label: "Medical Aid" },
  { value: "emergency-fund", label: "Emergency Fund" },
  { value: "estate-planning", label: "Estate Planning" },
];

// ─── Validation per step ──────────────────────────────────────────────────────
function validateStep(step: number, d: FnaData): string[] {
  const errors: string[] = [];
  if (step === 0) {
    if (!d.firstName.trim()) errors.push("First name is required");
    if (!d.lastName.trim()) errors.push("Last name is required");
    if (!d.email.includes("@")) errors.push("Valid email is required");
    if (d.phone.length < 10) errors.push("Valid phone number is required");
    if (!d.dob) errors.push("Date of birth is required");
    if (!d.gender) errors.push("Gender is required");
    if (!d.smoker) errors.push("Smoker status is required");
    if (!d.maritalStatus) errors.push("Marital status is required");
  }
  if (step === 1) {
    if (!d.employmentType) errors.push("Employment type is required");
    if (d.grossMonthlyIncome <= 0) errors.push("Gross monthly income must be greater than 0");
  }
  if (step === 2) {
    if (d.monthlyExpenses <= 0) errors.push("Monthly expenses must be greater than 0");
  }
  if (step === 5) {
    if (!d.riskProfile) errors.push("Risk profile is required");
  }
  return errors;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FnaForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateFnaSubmission();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [data, setData] = useState<FnaData>(DEFAULTS);

  const set = useCallback((field: keyof FnaData, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const setNum = useCallback((field: keyof FnaData, value: string) => {
    setData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  }, []);

  const handleDob = (val: string) => {
    set("dob", val);
    if (val) {
      const age = Math.floor((Date.now() - new Date(val).getTime()) / 31_557_600_000);
      set("currentAge", age);
    }
  };

  const togglePriority = (val: string) => {
    setData(prev => ({
      ...prev,
      priorities: prev.priorities.includes(val)
        ? prev.priorities.filter(p => p !== val)
        : [...prev.priorities, val],
    }));
  };

  const next = () => {
    const errs = validateStep(step, data);
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    setStep(s => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo(0, 0);
  };

  const prev = () => { setErrors([]); setStep(s => Math.max(0, s - 1)); window.scrollTo(0, 0); };

  const handleSubmit = () => {
    createMutation.mutate(
      {
        data: {
          firstName: data.firstName, lastName: data.lastName,
          email: data.email, phone: data.phone, dob: data.dob,
          gender: data.gender, smoker: data.smoker,
          maritalStatus: data.maritalStatus, dependants: data.dependants,
          currentAge: data.currentAge,
          grossMonthlyIncome: data.grossMonthlyIncome,
          netMonthlyIncome: data.netMonthlyIncome,
          spouseIncome: data.spouseIncome,
          employmentType: data.employmentType,
          occupation: data.occupation,
          hasGroupBenefits: data.hasGroupBenefits,
          monthlyExpenses: data.monthlyExpenses,
          homeLoans: data.homeLoans, vehicleFinance: data.vehicleFinance,
          personalLoans: data.personalLoans, creditCards: data.creditCards,
          otherDebts: data.otherDebts, savings: data.savings,
          investments: data.investments, retirementFunds: data.retirementFunds,
          propertyValue: data.propertyValue,
          existingLifeCover: data.existingLifeCover,
          existingDisabilityCover: data.existingDisabilityCover,
          existingDreadDiseaseCover: data.existingDreadDiseaseCover,
          targetRetirementAge: data.targetRetirementAge,
          monthlyRetirementIncome: data.monthlyRetirementIncome,
          currentRetirementSavings: data.currentRetirementSavings,
          monthlyInvestmentBudget: data.monthlyInvestmentBudget,
          investmentGoal: data.investmentGoal, riskProfile: data.riskProfile,
          investmentHorizon: data.investmentHorizon,
          priorities: JSON.stringify(data.priorities),
          notes: data.notes,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFnaSubmissionsQueryKey() });
          toast({ title: "FNA Submitted", description: "Financial Needs Analysis saved successfully." });
          setLocation("/fna/list");
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to submit FNA. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const calc = calcFna(data);
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#718096]">Financial Needs Analysis</span>
        <span className="text-sm font-bold text-[#1B2A4A]">Step {step + 1} of {STEPS.length}</span>
        <div className="text-right">
          <span className="text-xs text-[#718096]">Progress</span>
          <div className="text-sm font-bold text-[#C9A52A]">{progress}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div className="h-1 bg-[#C9A52A] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Step nav */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 overflow-x-auto">
        <div className="flex gap-1 min-w-max mx-auto max-w-5xl">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${i === step ? "bg-[#1B2A4A]/5" : ""}`}>
              <span className="text-lg">{s.icon}</span>
              <span className={`text-[10px] text-center leading-tight mt-0.5 whitespace-pre-line font-medium ${i === step ? "text-[#1B2A4A]" : i < step ? "text-[#C9A52A]" : "text-gray-400"}`}>
                {i < step ? "✓ " : ""}{s.label}
              </span>
              {i === step && <div className="h-0.5 w-full bg-[#C9A52A] mt-1 rounded-full" />}
            </div>
          ))}
        </div>
      </div>

      {/* Form body */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 space-y-1">
            {errors.map((e, i) => <div key={i}>• {e}</div>)}
          </div>
        )}

        {/* ── Step 1: Personal Details ─────────────────────────────────── */}
        {step === 0 && (
          <SectionCard title="Personal Details" subtitle="Tell us about yourself so we can personalise your analysis." icon="👤">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name">
                <TextInput value={data.firstName} onChange={v => set("firstName", v)} placeholder="John" />
              </Field>
              <Field label="Last Name">
                <TextInput value={data.lastName} onChange={v => set("lastName", v)} placeholder="Smith" />
              </Field>
              <Field label="Email Address">
                <TextInput value={data.email} onChange={v => set("email", v)} placeholder="john@email.com" type="email" />
              </Field>
              <Field label="Phone Number">
                <TextInput value={data.phone} onChange={v => set("phone", v)} placeholder="+27 82 000 0000" />
              </Field>
              <Field label="Date of Birth" help="Calculated from your date of birth">
                <TextInput value={data.dob} onChange={handleDob} type="date" />
              </Field>
              <Field label="Gender" help="Affects life & disability premium estimates">
                <SelectInput value={data.gender} onChange={v => set("gender", v)} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} />
              </Field>
              <Field label="Smoker?" help="Smokers pay 30–50% higher premiums">
                <SelectInput value={data.smoker} onChange={v => set("smoker", v)} options={[{ value: "no", label: "Non-smoker" }, { value: "yes", label: "Smoker" }]} />
              </Field>
              <Field label="Marital Status">
                <SelectInput value={data.maritalStatus} onChange={v => set("maritalStatus", v)} options={[
                  { value: "single", label: "Single" },
                  { value: "married", label: "Married" },
                  { value: "divorced", label: "Divorced" },
                  { value: "widowed", label: "Widowed" },
                ]} />
              </Field>
              <div className="col-span-2">
                <Field label="Number of Financial Dependants" help="Children, spouse, parents or others who depend on your income">
                  <TextInput value={data.dependants} onChange={v => setNum("dependants", v)} type="number" placeholder="0" />
                </Field>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Step 2: Income & Employment ──────────────────────────────── */}
        {step === 1 && (
          <SectionCard title="Income & Employment" subtitle="Your income determines your cover needs and affordability." icon="💼">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Employment Type">
                  <SelectInput value={data.employmentType} onChange={v => set("employmentType", v)} options={[
                    { value: "employed", label: "Employed (salary)" },
                    { value: "self-employed", label: "Self-employed / Freelance" },
                    { value: "business-owner", label: "Business Owner" },
                    { value: "contractor", label: "Contractor" },
                    { value: "retired", label: "Retired" },
                    { value: "unemployed", label: "Unemployed" },
                  ]} />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Occupation / Job Title">
                  <TextInput value={data.occupation} onChange={v => set("occupation", v)} placeholder="e.g. Software Engineer, Teacher, Business Owner" />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Do you have group benefits through your employer?" help="Group benefits may reduce your cover gap — enter them in step 4">
                  <SelectInput value={data.hasGroupBenefits} onChange={v => set("hasGroupBenefits", v)} options={[
                    { value: "yes", label: "Yes — I have group life/disability/pension through work" },
                    { value: "no", label: "No — I have no group benefits" },
                  ]} />
                </Field>
              </div>
              <Field label="Gross Monthly Income" help="Before tax and deductions">
                <TextInput value={data.grossMonthlyIncome || ""} onChange={v => setNum("grossMonthlyIncome", v)} type="number" prefix="R" placeholder="0" />
              </Field>
              <Field label="Net Monthly Income (Take-home)">
                <TextInput value={data.netMonthlyIncome || ""} onChange={v => setNum("netMonthlyIncome", v)} type="number" prefix="R" placeholder="0" />
              </Field>
              <div className="col-span-2">
                <Field label="Spouse / Partner Income (if applicable)">
                  <TextInput value={data.spouseIncome || ""} onChange={v => setNum("spouseIncome", v)} type="number" prefix="R" placeholder="0" />
                </Field>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Step 3: Expenses & Liabilities ───────────────────────────── */}
        {step === 2 && (
          <SectionCard title="Expenses & Liabilities" subtitle="Understanding your financial obligations helps us calculate what you truly need." icon="📊">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Total Monthly Household Expenses">
                  <TextInput value={data.monthlyExpenses || ""} onChange={v => setNum("monthlyExpenses", v)} type="number" prefix="R" placeholder="0" />
                </Field>
              </div>
              <Field label="Home Loans">
                <TextInput value={data.homeLoans || ""} onChange={v => setNum("homeLoans", v)} type="number" prefix="R" placeholder="0" />
              </Field>
              <Field label="Vehicle Finance">
                <TextInput value={data.vehicleFinance || ""} onChange={v => setNum("vehicleFinance", v)} type="number" prefix="R" placeholder="0" />
              </Field>
              <Field label="Personal Loans">
                <TextInput value={data.personalLoans || ""} onChange={v => setNum("personalLoans", v)} type="number" prefix="R" placeholder="0" />
              </Field>
              <Field label="Credit Cards">
                <TextInput value={data.creditCards || ""} onChange={v => setNum("creditCards", v)} type="number" prefix="R" placeholder="0" />
              </Field>
              <div className="col-span-2">
                <Field label="Other Debts">
                  <TextInput value={data.otherDebts || ""} onChange={v => setNum("otherDebts", v)} type="number" prefix="R" placeholder="0" />
                </Field>
              </div>
              <div className="col-span-2 bg-[#1B2A4A]/5 rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-[#1B2A4A]">Total Liabilities</span>
                <span className="text-lg font-bold text-[#1B2A4A]">{fmt(calc.totalDebt)}</span>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Step 4: Assets & Existing Cover ──────────────────────────── */}
        {step === 3 && (
          <SectionCard title="Assets & Existing Cover" subtitle="Your current cover and savings reduce the gap we need to fill." icon="🏦">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Savings / Cash (Bank)">
                <TextInput value={data.savings || ""} onChange={v => setNum("savings", v)} type="number" prefix="R" placeholder="0" />
              </Field>
              <Field label="Investments (Unit Trusts / Shares)">
                <TextInput value={data.investments || ""} onChange={v => setNum("investments", v)} type="number" prefix="R" placeholder="0" />
              </Field>
              <Field label="Retirement Funds / Pension / RA">
                <TextInput value={data.retirementFunds || ""} onChange={v => setNum("retirementFunds", v)} type="number" prefix="R" placeholder="0" />
              </Field>
              <Field label="Property Value (home / investment)">
                <TextInput value={data.propertyValue || ""} onChange={v => setNum("propertyValue", v)} type="number" prefix="R" placeholder="0" />
              </Field>
              <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1B2A4A] mb-3">Existing Insurance Cover</p>
              </div>
              <Field label="Existing Life Cover (total)" help="Life cover">
                <TextInput value={data.existingLifeCover || ""} onChange={v => setNum("existingLifeCover", v)} type="number" prefix="R" placeholder="0" />
              </Field>
              <Field label="Existing Disability Cover (lump sum)" help="Capital disability payout, not monthly income">
                <TextInput value={data.existingDisabilityCover || ""} onChange={v => setNum("existingDisabilityCover", v)} type="number" prefix="R" placeholder="0" />
              </Field>
              <div className="col-span-2">
                <Field label="Existing Dread Disease / Critical Illness Cover">
                  <TextInput value={data.existingDreadDiseaseCover || ""} onChange={v => setNum("existingDreadDiseaseCover", v)} type="number" prefix="R" placeholder="0" />
                </Field>
              </div>
              <div className="col-span-2 bg-[#1B2A4A]/5 rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-[#1B2A4A]">Total Assets</span>
                <span className="text-lg font-bold text-[#1B2A4A]">{fmt(calc.totalAssets)}</span>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Step 5: Retirement Planning ───────────────────────────────── */}
        {step === 4 && (
          <SectionCard title="Retirement Planning" subtitle="Let's plan your retirement so you can retire with confidence." icon="🎯">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Current Age" help="Calculated from your date of birth">
                <TextInput value={data.currentAge || ""} onChange={v => setNum("currentAge", v)} type="number" placeholder="35" />
              </Field>
              <Field label="Target Retirement Age" help="Age you want to retire">
                <TextInput value={data.targetRetirementAge} onChange={v => setNum("targetRetirementAge", v)} type="number" placeholder="65" />
              </Field>
              <div className="col-span-2">
                <Field label="Desired Monthly Income in Retirement (today's money)">
                  <TextInput value={data.monthlyRetirementIncome || ""} onChange={v => setNum("monthlyRetirementIncome", v)} type="number" prefix="R" placeholder="0" />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Current Retirement Savings" help="Retirement annuities, pension, provident fund total">
                  <TextInput value={data.currentRetirementSavings || ""} onChange={v => setNum("currentRetirementSavings", v)} type="number" prefix="R" placeholder="0" />
                </Field>
              </div>
              {data.currentAge > 0 && (
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <div className="bg-[#1B2A4A]/5 rounded-xl p-4">
                    <div className="text-xs text-[#718096] font-semibold uppercase">Years to Retirement</div>
                    <div className="text-2xl font-bold text-[#1B2A4A] mt-1">{calc.yearsToRetirement}</div>
                  </div>
                  <div className={`rounded-xl p-4 ${calc.retirementShortfall > 0 ? "bg-amber-50" : "bg-green-50"}`}>
                    <div className="text-xs font-semibold uppercase text-[#718096]">Corpus Needed</div>
                    <div className={`text-lg font-bold mt-1 ${calc.retirementShortfall > 0 ? "text-amber-700" : "text-green-700"}`}>
                      {fmt(calc.retirementCorpusNeeded)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* ── Step 6: Investment Goals ──────────────────────────────────── */}
        {step === 5 && (
          <SectionCard title="Investment Goals & Risk Profile" subtitle="Help us understand your financial priorities and investment style." icon="📈">
            <div className="space-y-6">
              {/* Investment Goal */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#1B2A4A] mb-3">Primary Investment Goal</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: "growth", l: "Wealth Growth" },
                    { v: "income", l: "Passive Income" },
                    { v: "education", l: "Children's Education" },
                    { v: "property", l: "Property Purchase" },
                    { v: "emergency", l: "Emergency Fund" },
                  ].map(g => (
                    <button
                      key={g.v}
                      type="button"
                      onClick={() => set("investmentGoal", g.v)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                        data.investmentGoal === g.v
                          ? "bg-[#1B2A4A] text-white border-[#1B2A4A]"
                          : "bg-white text-[#1B2A4A] border-gray-200 hover:border-[#1B2A4A]"
                      }`}
                    >
                      {g.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Profile */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#1B2A4A] mb-3">Risk Appetite</p>
                <div className="space-y-3">
                  {[
                    { v: "conservative", l: "Conservative", desc: "I want safety. Low risk, lower returns. Capital protection first." },
                    { v: "moderate", l: "Moderate", desc: "Balanced approach. Some risk for reasonable growth. Mix of equity and bonds." },
                    { v: "aggressive", l: "Aggressive", desc: "I can stomach volatility for maximum long-term growth. Mostly equity." },
                  ].map(r => (
                    <button
                      key={r.v}
                      type="button"
                      onClick={() => set("riskProfile", r.v)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        data.riskProfile === r.v
                          ? "bg-[#1B2A4A] text-white border-[#1B2A4A]"
                          : "bg-white border-gray-200 hover:border-[#1B2A4A]"
                      }`}
                    >
                      <div className="font-bold text-sm">{r.l}</div>
                      <div className={`text-xs mt-0.5 ${data.riskProfile === r.v ? "text-white/70" : "text-[#718096]"}`}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Investment Horizon */}
              <Field label="Investment Time Horizon (years)">
                <TextInput value={data.investmentHorizon} onChange={v => setNum("investmentHorizon", v)} type="number" placeholder="10" />
              </Field>

              {/* Monthly Budget */}
              <Field label="Monthly Investment Budget">
                <TextInput value={data.monthlyInvestmentBudget || ""} onChange={v => setNum("monthlyInvestmentBudget", v)} type="number" prefix="R" placeholder="0" />
              </Field>

              {/* Priorities */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#1B2A4A] mb-3">Financial Priorities (select all that apply)</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITY_OPTIONS.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => togglePriority(p.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                        data.priorities.includes(p.value)
                          ? "bg-[#C9A52A]/10 border-[#C9A52A] text-[#1B2A4A]"
                          : "bg-white border-gray-200 text-[#718096] hover:border-[#C9A52A]"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        data.priorities.includes(p.value) ? "bg-[#C9A52A] border-[#C9A52A]" : "border-gray-300"
                      }`}>
                        {data.priorities.includes(p.value) && <Check className="w-3 h-3 text-white" />}
                      </span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <Field label="Adviser Notes (optional)">
                <textarea
                  value={data.notes}
                  onChange={e => set("notes", e.target.value)}
                  placeholder="Any additional context for this client..."
                  className="px-4 py-3 border border-gray-200 rounded-lg bg-white text-sm text-[#1B2A4A] outline-none focus:border-[#1B2A4A] transition-colors resize-none h-20 w-full"
                />
              </Field>
            </div>
          </SectionCard>
        )}

        {/* ── Step 7: FNA Results ───────────────────────────────────────── */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-[#1B2A4A]">Your Financial Needs Analysis</h2>
              <p className="text-sm text-[#718096]">Based on the information provided, here is your personalised analysis</p>
            </div>

            {/* Net Worth */}
            <div className="bg-[#1B2A4A] text-white rounded-2xl p-5 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-white/60 uppercase font-semibold">Total Assets</div>
                <div className="text-lg font-bold mt-1">{fmt(calc.totalAssets)}</div>
              </div>
              <div>
                <div className="text-xs text-white/60 uppercase font-semibold">Total Debt</div>
                <div className="text-lg font-bold mt-1">{fmt(calc.totalDebt)}</div>
              </div>
              <div>
                <div className="text-xs text-white/60 uppercase font-semibold">Net Worth</div>
                <div className={`text-lg font-bold mt-1 ${calc.netWorth >= 0 ? "text-[#C9A52A]" : "text-red-400"}`}>{fmt(calc.netWorth)}</div>
              </div>
            </div>

            {/* Monthly cash flow */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#718096] uppercase font-semibold">Net Monthly Income</div>
                <div className="text-xl font-bold text-[#1B2A4A] mt-1">{fmt(calc.netIncome)}</div>
              </div>
              <div>
                <div className="text-xs text-[#718096] uppercase font-semibold">Monthly Surplus</div>
                <div className={`text-xl font-bold mt-1 ${calc.monthlyShortfall > 0 ? "text-green-600" : "text-red-600"}`}>{fmt(calc.monthlyShortfall)}</div>
              </div>
            </div>

            {/* Cover Gaps */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-bold text-[#1B2A4A] flex items-center gap-2">🛡️ Cover Gaps</h3>
              {[
                { label: "Life Cover Gap", gap: calc.lifeCoverGap, need: calc.lifeCoverNeed, premium: calc.lifePremium },
                { label: "Disability Cover Gap", gap: calc.disabilityGap, need: calc.disabilityNeed, premium: calc.disabilityPremium },
                { label: "Dread Disease Gap", gap: calc.dreadDiseaseGap, need: calc.dreadDiseaseNeed, premium: calc.dreadPremium },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="text-sm font-semibold text-[#1B2A4A]">{item.label}</div>
                      <div className="text-xs text-[#718096]">Need: {fmt(item.need)}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${item.gap > 0 ? "text-red-600" : "text-green-600"}`}>
                        {item.gap > 0 ? `⚠ Shortfall ${fmt(item.gap)}` : "✓ Covered"}
                      </div>
                      {item.gap > 0 && <div className="text-xs text-[#718096]">~{fmt(item.premium)}/mo</div>}
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className={`h-1.5 rounded-full ${item.gap > 0 ? "bg-red-400" : "bg-green-400"}`}
                      style={{ width: `${Math.min(100, item.need > 0 ? ((item.need - item.gap) / item.need) * 100 : 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Retirement */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-[#1B2A4A] flex items-center gap-2 mb-3">🎯 Retirement Planning</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-[#718096] uppercase font-semibold">Corpus Needed</div>
                  <div className="text-lg font-bold text-[#1B2A4A]">{fmt(calc.retirementCorpusNeeded)}</div>
                </div>
                <div>
                  <div className="text-xs text-[#718096] uppercase font-semibold">Shortfall</div>
                  <div className={`text-lg font-bold ${calc.retirementShortfall > 0 ? "text-amber-600" : "text-green-600"}`}>
                    {calc.retirementShortfall > 0 ? `⚠ ${fmt(calc.retirementShortfall)}` : "✓ On track"}
                  </div>
                </div>
                {calc.monthlyContributionNeeded > 0 && (
                  <div className="col-span-2 bg-amber-50 rounded-xl p-3">
                    <div className="text-xs text-amber-700 font-semibold">Recommended Monthly Contribution</div>
                    <div className="text-xl font-bold text-amber-800">{fmt(calc.monthlyContributionNeeded)}/mo</div>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Fund */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-[#1B2A4A] flex items-center gap-2 mb-3">🚨 Emergency Fund</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-[#718096] uppercase font-semibold">Target (6 months)</div>
                  <div className="text-lg font-bold text-[#1B2A4A]">{fmt(calc.emergencyFundTarget)}</div>
                </div>
                <div>
                  <div className="text-xs text-[#718096] uppercase font-semibold">Gap</div>
                  <div className={`text-lg font-bold ${calc.emergencyFundGap > 0 ? "text-red-600" : "text-green-600"}`}>
                    {calc.emergencyFundGap > 0 ? fmt(calc.emergencyFundGap) : "✓ Funded"}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Premium */}
            <div className="bg-[#1B2A4A] text-white rounded-2xl p-5">
              <h3 className="font-bold flex items-center gap-2 mb-3">💡 Recommended Cover</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-white/60 uppercase font-semibold">Total Recommended Premium</div>
                  <div className="text-2xl font-bold text-[#C9A52A] mt-1">{fmt(calc.totalRecommendedPremium)}/mo</div>
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase font-semibold">Affordability Ratio</div>
                  <div className={`text-2xl font-bold mt-1 ${calc.affordabilityRatio < 0.2 ? "text-green-400" : calc.affordabilityRatio < 0.3 ? "text-amber-400" : "text-red-400"}`}>
                    {pct(calc.affordabilityRatio)}
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/50 mt-3">Estimates only. Actual premiums depend on underwriting, product selection and health disclosures.</p>
            </div>
          </div>
        )}

        {/* ── Step 8: Review & Submit ───────────────────────────────────── */}
        {step === 7 && (
          <SectionCard title="Review & Submit" subtitle="Please confirm the details below before submitting the Financial Needs Analysis." icon="🎉">
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div className="text-[#718096]">Client</div>
                <div className="font-semibold text-[#1B2A4A]">{data.firstName} {data.lastName}</div>
                <div className="text-[#718096]">Email</div>
                <div className="font-semibold text-[#1B2A4A]">{data.email}</div>
                <div className="text-[#718096]">Phone</div>
                <div className="font-semibold text-[#1B2A4A]">{data.phone}</div>
                <div className="text-[#718096]">Employment</div>
                <div className="font-semibold text-[#1B2A4A] capitalize">{data.employmentType}</div>
                <div className="text-[#718096]">Gross Monthly Income</div>
                <div className="font-semibold text-[#1B2A4A]">{fmt(data.grossMonthlyIncome)}</div>
                <div className="text-[#718096]">Risk Profile</div>
                <div className="font-semibold text-[#1B2A4A] capitalize">{data.riskProfile}</div>
                <div className="text-[#718096]">Total Recommended Premium</div>
                <div className="font-bold text-[#C9A52A]">{fmt(calc.totalRecommendedPremium)}/mo</div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="w-full py-4 bg-[#1B2A4A] hover:bg-[#0f1e36] text-white font-bold rounded-xl text-base transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? "Submitting..." : "Submit Financial Needs Analysis"}
                </button>
                <p className="text-xs text-[#718096] text-center mt-3">
                  By submitting, you authorise MyIFAPortal to contact this client regarding their financial needs.
                </p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-6 pb-8">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-[#1B2A4A] bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-sm text-[#718096] font-medium">{step + 1} / {STEPS.length}</span>
          {step < STEPS.length - 1 && (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1B2A4A] text-white text-sm font-semibold hover:bg-[#0f1e36] transition-colors"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === STEPS.length - 1 && (
            <div className="w-28" /> /* spacer so Back stays left */
          )}
        </div>
      </div>
    </div>
  );
}
