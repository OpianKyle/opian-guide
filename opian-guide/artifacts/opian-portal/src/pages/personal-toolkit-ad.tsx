import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  useCreateToolkitSubmission,
  type ToolkitSubmission,
} from "@workspace/api-client-react";
import {
  calculateToolkit,
  getQuestionOptions,
  getToolkitName,
  getToolkitOptionLabel,
  getToolkitSteps,
  validateToolkitAnswers,
  type ToolkitAnswer,
  type ToolkitAnswers,
  type ToolkitKind,
  type ToolkitQuestion,
} from "@workspace/toolkit-core";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  HeartHandshake,
  House,
  LockKeyhole,
  PiggyBank,
  ShieldCheck,
  TriangleAlert,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { downloadToolkitPdf } from "@/lib/toolkit-pdf";

type Flow = "questions" | "account" | "signup" | "verify" | "signin" | "report";

const KIND: ToolkitKind = "personal";

function Field({
  question,
  answers,
  setAnswer,
}: {
  question: ToolkitQuestion;
  answers: ToolkitAnswers;
  setAnswer: (id: string, value: ToolkitAnswer) => void;
}) {
  const selected = answers[question.id];
  const options = getQuestionOptions(question, answers);
  if (question.visibleWhen && !question.visibleWhen(answers)) return null;
  const OptionIcon = (option: string) => {
    const label = `${question.id} ${option}`.toLowerCase();
    if (/age|depend|child|family|people/.test(label)) return UsersRound;
    if (/single|married|partner|divorced|widowed/.test(label)) return HeartHandshake;
    if (/employ|business|retired|work/.test(label)) return BriefcaseBusiness;
    if (/income|budget|r\d|sure|not sure/.test(label)) return Wallet;
    if (/home|bond|rent|own/.test(label)) return House;
    if (/will|estate/.test(label)) return FileText;
    if (/saving|month|none/.test(label)) return PiggyBank;
    return ShieldCheck;
  };

  return (
    <fieldset className="space-y-3" data-testid={`question-${question.id}`}>
      {question.kind !== "consent" && (
        <legend className="mb-3 block text-[15px] font-semibold leading-snug text-[#223b4a]">
          {question.label}
          {question.required && <span className="ml-1 text-[#c75e43]" aria-label="required">*</span>}
        </legend>
      )}
      {question.help && <p className="-mt-1 text-sm leading-relaxed text-[#66777b]">{question.help}</p>}
      {question.kind === "choice" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const active = selected === option;
            const Icon = OptionIcon(option);
            return (
              <label
                key={option}
                className={`group flex min-h-[76px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-[#287568] focus-within:ring-offset-2 ${
                  active
                    ? "border-[#287568] bg-[#eaf4ef] text-[#174e46] shadow-[0_8px_22px_rgba(40,117,104,.10)]"
                    : "border-[#dce5df] bg-white/75 text-[#344d54] hover:border-[#8fb3a7] hover:bg-[#f8fbf8]"
                }`}
              >
                <input
                  className="h-4 w-4 shrink-0 accent-[#287568]"
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={active}
                  onChange={() => setAnswer(question.id, option)}
                  data-testid={`answer-${question.id}-${option.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                />
                <span aria-hidden="true" className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${active ? "bg-[#287568] text-white" : "bg-[#eff3eb] text-[#55796e] group-hover:bg-[#e4eee5]"}`}>
                  <Icon size={19} strokeWidth={1.7} />
                </span>
                <span>{getToolkitOptionLabel(KIND, question, option)}</span>
              </label>
            );
          })}
        </div>
      )}
      {question.kind === "multi" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const values = Array.isArray(selected) ? selected : [];
            const active = values.includes(option);
            const Icon = OptionIcon(option);
            return (
              <label
                key={option}
                className={`group flex min-h-[76px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-[#287568] focus-within:ring-offset-2 ${active ? "border-[#287568] bg-[#eaf4ef] text-[#174e46] shadow-[0_8px_22px_rgba(40,117,104,.10)]" : "border-[#dce5df] bg-white/75 text-[#344d54] hover:border-[#8fb3a7] hover:bg-[#f8fbf8]"}`}
              >
                <input
                  className="h-4 w-4 accent-[#287568]"
                  type="checkbox"
                  checked={active}
                  onChange={(event) =>
                    setAnswer(
                      question.id,
                      event.target.checked
                        ? [...values, option]
                        : values.filter((value) => value !== option),
                    )
                  }
                  data-testid={`answer-${question.id}-${option}`}
                />
                <span aria-hidden="true" className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${active ? "bg-[#287568] text-white" : "bg-[#eff3eb] text-[#55796e] group-hover:bg-[#e4eee5]"}`}>
                  <Icon size={19} strokeWidth={1.7} />
                </span>
                <span>{getToolkitOptionLabel(KIND, question, option)}</span>
              </label>
            );
          })}
        </div>
      )}
      {["money", "number", "text"].includes(question.kind) && (
        <input
          className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-[15px] text-[#223b4a] outline-none transition focus:border-[#287568] focus:ring-2 focus:ring-[#287568]/15"
          type={question.kind === "money" || question.kind === "number" ? "number" : "text"}
          inputMode={question.kind === "money" || question.kind === "number" ? "numeric" : "text"}
          min={question.min}
          max={question.max}
          step={question.kind === "money" ? "1" : undefined}
          value={typeof selected === "string" || typeof selected === "number" ? String(selected) : ""}
          onChange={(event) => setAnswer(question.id, event.target.value)}
          placeholder={question.kind === "money" ? "R 0" : undefined}
          aria-label={question.label}
          data-testid={`answer-${question.id}`}
        />
      )}
      {question.kind === "consent" && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#dce5df] bg-[#f8fbf8] p-4 text-sm leading-relaxed text-[#344d54] focus-within:ring-2 focus-within:ring-[#287568]">
          <input
            className="mt-1 h-4 w-4 shrink-0 accent-[#287568]"
            type="checkbox"
            checked={selected === true}
            onChange={(event) => setAnswer(question.id, event.target.checked)}
            data-testid={`answer-${question.id}`}
          />
          <span>
            {question.label}
            {question.required && <span className="ml-1 text-[#c75e43]" aria-label="required">*</span>}
          </span>
        </label>
      )}
    </fieldset>
  );
}

function ActionButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  testId,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "quiet";
  testId: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#287568] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        variant === "primary"
          ? "bg-[#c75e43] text-white shadow-[0_8px_20px_rgba(160,73,52,.18)] hover:bg-[#ae4c34]"
          : "border border-[#d4dfd8] bg-white/80 text-[#35545a] hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function PersonalToolkitAd() {
  const {
    user,
    adminUser,
    isLoading: authLoading,
    signup,
    verifyEmail,
    resendVerification,
    unifiedLogin,
    logout,
    adminLogout,
  } = useAuth();
  const createSubmission = useCreateToolkitSubmission();
  const steps = useMemo(() => getToolkitSteps(KIND), []);
  const [flow, setFlow] = useState<Flow>("questions");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<ToolkitAnswers>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [submission, setSubmission] = useState<ToolkitSubmission | null>(null);
  const [validatedAnswers, setValidatedAnswers] = useState<ToolkitAnswers | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const previousTitle = document.title;
    const descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = descriptionTag?.content;
    document.title = "MyIFA Personal Toolkit | Your financial protection check-in";
    if (descriptionTag) {
      descriptionTag.content =
        "Answer a few questions about your family, income and protection, then create a secure MyIFA client account to unlock your personal financial toolkit report.";
    }
    return () => {
      document.title = previousTitle;
      if (descriptionTag && previousDescription !== undefined) {
        descriptionTag.content = previousDescription;
      }
    };
  }, []);

  const currentStep = steps[stepIndex];
  const progress = flow === "questions" ? ((stepIndex + 1) / steps.length) * 100 : 0;
  const StepIllustration = [UsersRound, BriefcaseBusiness, House, ShieldCheck, HeartHandshake, CalendarDays][stepIndex] ?? ShieldCheck;
  const isClient = user?.role === "client" && !adminUser;
  const roleConflict = Boolean(adminUser || (user && user.role !== "client"));

  const setAnswer = (id: string, value: ToolkitAnswer) => {
    setAnswers((current) => {
      const next = { ...current, [id]: value };
      if (id === "goals" && Array.isArray(value) && typeof next.top === "string" && !value.includes(next.top)) {
        delete next.top;
      }
      return next;
    });
    setError("");
  };

  const validateStep = () => {
    for (const question of currentStep.fields) {
      if (question.visibleWhen && !question.visibleWhen(answers)) continue;
      const value = answers[question.id];
      const missing = value === undefined || value === "" || value === false || (Array.isArray(value) && value.length === 0);
      if (question.required && missing) {
        setError(`Please answer: ${question.label}`);
        return false;
      }
    }
    return true;
  };

  const continueQuestions = () => {
    if (!validateStep()) return;
    setError("");
    if (stepIndex < steps.length - 1) {
      setStepIndex((index) => index + 1);
      return;
    }
    try {
      const validated = validateToolkitAnswers(KIND, answers);
      setValidatedAnswers(validated);
      setFlow("account");
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "Please review your answers.");
    }
  };

  const submitVerifiedAnswers = async () => {
    if (!isClient || !validatedAnswers) {
      setError("Sign in or create a verified client account to continue.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await createSubmission.mutateAsync({
        data: { toolkit: KIND, answers: validatedAnswers },
      });
      setSubmission(result);
      setFlow("report");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We could not save your toolkit. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const createAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signup("client", name.trim(), email.trim(), password);
      setFlow("verify");
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "We could not create your account. Your answers are still here.");
    } finally {
      setBusy(false);
    }
  };

  const verifyAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await verifyEmail(email.trim(), code.trim());
      setFlow("account");
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : "That code could not be verified. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await unifiedLogin(email.trim(), password);
      if (result.admin || result.user?.role !== "client") {
        setError("This toolkit can only be submitted from a client account. Sign in with a client account to continue.");
        return;
      }
      setFlow("account");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "We could not sign you in. Please check your details.");
    } finally {
      setBusy(false);
    }
  };

  const signOutWrongRole = async () => {
    setBusy(true);
    setError("");
    try {
      if (adminUser) await adminLogout();
      else await logout();
      setFlow("signin");
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : "We could not sign out. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const resendCode = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await resendVerification(email.trim());
      setNotice("A new verification code has been sent to your email.");
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "We could not resend the code. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const downloadReport = async () => {
    if (!submission) return;
    setDownloadBusy(true);
    setDownloadError("");
    try {
      await downloadToolkitPdf(submission);
    } catch {
      setDownloadError("Your on-page report is ready, but the PDF could not be created. Please try again.");
    } finally {
      setDownloadBusy(false);
    }
  };

  const restart = () => {
    setFlow("questions");
    setStepIndex(0);
    setAnswers({});
    setValidatedAnswers(null);
    setSubmission(null);
    setError("");
    setDownloadError("");
  };

  const report = submission && validatedAnswers ? calculateToolkit(KIND, validatedAnswers) : null;

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#f5f4eb] px-4 py-5 text-[#223b4a] sm:px-6 sm:py-10">
      <div className="pointer-events-none fixed inset-0 opacity-[0.16]" aria-hidden="true" style={{ backgroundImage: "radial-gradient(#668579 0.65px, transparent 0.65px)", backgroundSize: "17px 17px" }} />
      <section className="relative mx-auto w-full max-w-3xl">
        <div className="absolute -right-20 -top-16 h-60 w-60 rounded-full bg-[#ecd8bd]/55 blur-3xl" aria-hidden="true" />
        <div className="relative rounded-[1.75rem] border border-[#e1e4d8] bg-[#fbfbf5]/95 p-5 shadow-[0_25px_75px_rgba(48,79,72,.09)] sm:rounded-[2rem] sm:p-8 lg:p-10">
            {flow === "questions" && currentStep && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" data-testid={`panel-toolkit-step-${stepIndex + 1}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#b45b43]">{getToolkitName(KIND)}</p>
                    <p className="mt-2 text-xs font-semibold text-[#647976]" data-testid="text-step-progress">Step {stepIndex + 1} of {steps.length}</p>
                  </div>
                  <span className="rounded-full bg-[#edf2e9] px-3 py-1.5 text-xs font-bold text-[#4f7166]" data-testid="text-progress-percent">{Math.round(progress)}%</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e4e9df]" role="progressbar" aria-label="Toolkit progress" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} data-testid="progress-toolkit">
                  <div className="h-full rounded-full bg-[#287568] transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-6 grid grid-cols-[82px_1fr] items-center gap-4 border-b border-[#e5e9df] pb-6 sm:mt-8 sm:grid-cols-[124px_1fr] sm:gap-6">
                  <div aria-hidden="true" className="relative grid aspect-square place-items-center overflow-hidden rounded-[1.4rem] bg-[#e6eee4] sm:rounded-[1.8rem]">
                    <span className="absolute -right-4 -top-5 h-16 w-16 rounded-full border-[10px] border-[#f1d18f]/80 sm:h-24 sm:w-24 sm:border-[14px]" />
                    <span className="absolute -bottom-7 -left-6 h-20 w-20 rounded-full bg-[#c5d9ca] sm:h-28 sm:w-28" />
                    <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-[#244b4a] text-[#f2d18c] shadow-[0_8px_20px_rgba(36,75,74,.18)] sm:h-[68px] sm:w-[68px] sm:rounded-[22px]">
                      <StepIllustration size={31} strokeWidth={1.55} className="sm:hidden" />
                      <StepIllustration size={39} strokeWidth={1.55} className="hidden sm:block" />
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[.17em] text-[#a67357]">A little context</p>
                    <h2 className="mt-1.5 font-serif text-[1.7rem] leading-tight tracking-[-.025em] sm:text-3xl" data-testid="text-step-title">{currentStep.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#687a77]" data-testid="text-step-intro">{currentStep.intro}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-7">
                  {currentStep.fields.map((question) => (
                    <Field key={question.id} question={question} answers={answers} setAnswer={setAnswer} />
                  ))}
                </div>
                {error && <p role="alert" className="mt-6 flex gap-2 rounded-xl bg-[#f9e9e2] p-3 text-sm leading-5 text-[#9f4937]" data-testid="status-form-error"><TriangleAlert size={17} className="mt-0.5 shrink-0" />{error}</p>}
                <div className="mt-8 flex items-center justify-between border-t border-[#e5e9df] pt-5">
                  <ActionButton variant="quiet" disabled={stepIndex === 0} onClick={() => { setStepIndex((index) => Math.max(0, index - 1)); setError(""); }} testId="button-step-back">
                    <ArrowLeft size={16} /> Back
                  </ActionButton>
                  <ActionButton onClick={continueQuestions} testId="button-step-continue">
                    {stepIndex === steps.length - 1 ? "Continue to account" : "Continue"} <ArrowRight size={16} />
                  </ActionButton>
                </div>
              </div>
            )}

            {(flow === "account" || flow === "signup" || flow === "verify" || flow === "signin") && (
              <div data-testid={`panel-account-${flow}`}>
                <p className="text-xs font-bold uppercase tracking-[.17em] text-[#b45b43]">Your answers are still here</p>
                {flow === "account" && (
                  <>
                    <h2 className="mt-3 font-serif text-3xl leading-tight tracking-[-.025em]">One secure step before your report.</h2>
                    <p className="mt-3 leading-7 text-[#657775]">We’ll only prepare and save your personal summary after you’re signed in to a verified MyIFA client account.</p>
                    {authLoading ? (
                      <div className="mt-7 animate-pulse space-y-3" aria-label="Checking account status" data-testid="status-auth-loading">
                        <div className="h-12 rounded-xl bg-[#e8ede5]" /><div className="h-12 w-2/3 rounded-xl bg-[#e8ede5]" />
                      </div>
                    ) : roleConflict ? (
                      <div className="mt-7 rounded-2xl border border-[#efc5b6] bg-[#fff3ec] p-5" role="alert" data-testid="status-role-conflict">
                        <p className="font-semibold text-[#884735]">This is a client toolkit.</p>
                        <p className="mt-2 text-sm leading-6 text-[#785b52]">You’re signed in with an adviser or administrator account. To keep submissions in the right place, sign out of that account and return with a client account. Your answers remain on this page.</p>
                        <div className="mt-4">
                          <ActionButton variant="quiet" onClick={() => void signOutWrongRole()} disabled={busy} testId="button-signout-wrong-role">
                            {busy ? "Signing out…" : "Sign out and use a client account"}
                          </ActionButton>
                        </div>
                      </div>
                    ) : isClient ? (
                      <div className="mt-7 rounded-2xl bg-[#eaf3ed] p-5" data-testid="status-client-ready">
                        <p className="flex items-center gap-2 font-semibold text-[#285d4f]"><ShieldCheck size={18} /> Client account verified</p>
                        <p className="mt-2 text-sm text-[#5b766d]">Signed in as {user.name} · {user.email}</p>
                        <ActionButton onClick={() => void submitVerifiedAnswers()} disabled={busy} testId="button-submit-toolkit" >
                          {busy ? "Preparing your report…" : "Get my personal summary"} {!busy && <ArrowRight size={16} />}
                        </ActionButton>
                      </div>
                    ) : (
                      <div className="mt-7 space-y-3">
                        <ActionButton onClick={() => { setFlow("signup"); setError(""); }} testId="button-create-client-account">
                          Create a client account <ArrowRight size={16} />
                        </ActionButton>
                        <button type="button" className="block min-h-10 text-sm font-semibold text-[#287568] underline decoration-[#b5cfc0] underline-offset-4 hover:text-[#174e46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#287568]" onClick={() => { setFlow("signin"); setError(""); }} data-testid="button-open-signin">
                          Already have a MyIFA client account? Sign in
                        </button>
                      </div>
                    )}
                  </>
                )}
                {flow === "signup" && (
                  <>
                    <h2 className="mt-3 font-serif text-3xl leading-tight tracking-[-.025em]">Create your client account.</h2>
                    <p className="mt-3 leading-7 text-[#657775]">We’ll verify your email before preparing or saving your report.</p>
                    <form onSubmit={createAccount} className="mt-7 space-y-4">
                      <label className="block space-y-2 text-sm font-semibold" htmlFor="signup-name">Your name
                        <input id="signup-name" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-[15px] font-normal outline-none focus:border-[#287568] focus:ring-2 focus:ring-[#287568]/15" data-testid="input-account-name" />
                      </label>
                      <label className="block space-y-2 text-sm font-semibold" htmlFor="signup-email">Email address
                        <input id="signup-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-[15px] font-normal outline-none focus:border-[#287568] focus:ring-2 focus:ring-[#287568]/15" data-testid="input-account-email" />
                      </label>
                      <label className="block space-y-2 text-sm font-semibold" htmlFor="signup-password">Password
                        <input id="signup-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-[15px] font-normal outline-none focus:border-[#287568] focus:ring-2 focus:ring-[#287568]/15" data-testid="input-account-password" />
                      </label>
                      <ActionButton type="submit" disabled={busy} testId="button-signup-client">{busy ? "Creating account…" : "Create account and verify"} {!busy && <ArrowRight size={16} />}</ActionButton>
                    </form>
                    <button type="button" onClick={() => { setFlow("account"); setError(""); }} className="mt-4 min-h-10 text-sm font-semibold text-[#287568] underline decoration-[#b5cfc0] underline-offset-4" data-testid="button-cancel-signup">Back to account options</button>
                  </>
                )}
                {flow === "verify" && (
                  <>
                    <h2 className="mt-3 font-serif text-3xl leading-tight tracking-[-.025em]">Check your inbox.</h2>
                    <p className="mt-3 leading-7 text-[#657775]">Enter the verification code sent to <strong>{email}</strong>. Your report stays locked until your email is verified.</p>
                    <form onSubmit={verifyAccount} className="mt-7 space-y-4">
                      <label className="block text-sm font-semibold" htmlFor="verification-code">Verification code</label>
                      <input id="verification-code" autoComplete="one-time-code" inputMode="numeric" required value={code} onChange={(event) => setCode(event.target.value)} className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-[15px] outline-none focus:border-[#287568] focus:ring-2 focus:ring-[#287568]/15" data-testid="input-verification-code" />
                      <ActionButton type="submit" disabled={busy} testId="button-verify-email">{busy ? "Verifying…" : "Verify email"} {!busy && <ArrowRight size={16} />}</ActionButton>
                    </form>
                    <button type="button" onClick={() => void resendCode()} disabled={busy} className="mt-4 min-h-10 text-sm font-semibold text-[#287568] underline decoration-[#b5cfc0] underline-offset-4 disabled:opacity-60" data-testid="button-resend-verification">Resend verification code</button>
                  </>
                )}
                {flow === "signin" && (
                  <>
                    <h2 className="mt-3 font-serif text-3xl leading-tight tracking-[-.025em]">Welcome back.</h2>
                    <p className="mt-3 leading-7 text-[#657775]">Sign in with your MyIFA client account. Adviser and administrator accounts can’t submit this report.</p>
                    <form onSubmit={signIn} className="mt-7 space-y-4">
                      <label className="block space-y-2 text-sm font-semibold" htmlFor="signin-email">Email address
                        <input id="signin-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-[15px] font-normal outline-none focus:border-[#287568] focus:ring-2 focus:ring-[#287568]/15" data-testid="input-signin-email" />
                      </label>
                      <label className="block space-y-2 text-sm font-semibold" htmlFor="signin-password">Password
                        <input id="signin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-[15px] font-normal outline-none focus:border-[#287568] focus:ring-2 focus:ring-[#287568]/15" data-testid="input-signin-password" />
                      </label>
                      <ActionButton type="submit" disabled={busy} testId="button-client-signin">{busy ? "Signing in…" : "Sign in"} {!busy && <ArrowRight size={16} />}</ActionButton>
                    </form>
                    <button type="button" onClick={() => { setFlow("account"); setError(""); }} className="mt-4 min-h-10 text-sm font-semibold text-[#287568] underline decoration-[#b5cfc0] underline-offset-4" data-testid="button-back-account-options">Back to account options</button>
                  </>
                )}
                {error && <p role="alert" className="mt-5 rounded-xl bg-[#f9e9e2] p-3 text-sm leading-5 text-[#9f4937]" data-testid="status-account-error">{error}</p>}
                {notice && <p role="status" className="mt-5 rounded-xl bg-[#eaf3ed] p-3 text-sm leading-5 text-[#285d4f]" data-testid="status-account-notice">{notice}</p>}
                <p className="mt-7 flex items-center gap-2 border-t border-[#e5e9df] pt-5 text-xs leading-5 text-[#71817d]"><LockKeyhole size={14} className="shrink-0" /> Your financial answers are not saved until your verified client account submits them.</p>
              </div>
            )}

            {flow === "report" && submission && report && (
              <div data-testid="panel-toolkit-report">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f1e8] text-[#287568]"><CheckCircle2 size={25} /></div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[.17em] text-[#287568]">Your snapshot is ready</p>
                <h2 className="mt-2 font-serif text-3xl leading-tight tracking-[-.025em]" data-testid="text-report-title">A starting point, made personal.</h2>
                <p className="mt-3 text-sm leading-6 text-[#687a77]">This is an indicative guide based on what you shared, not a recommendation or financial advice. An adviser can help you refine it.</p>
                {report.figures.length > 0 && (
                  <section className="mt-7 rounded-2xl bg-[#244b4a] p-5 text-[#fbf8ed] sm:p-6" aria-labelledby="figures-title" data-testid="section-report-figures">
                    <p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#d6c78f]">{report.figureTitle}</p>
                    <div className="mt-4 divide-y divide-white/15">
                      {report.figures.map((figure, index) => (
                        <div key={`${figure.label}-${index}`} className="flex items-start justify-between gap-4 py-3" data-testid={`figure-report-${index}`}>
                          <span className={`text-sm leading-5 ${figure.total ? "font-semibold text-[#f4d18a]" : "text-[#e0e9dc]"}`}>{figure.label}</span>
                          <span className={`shrink-0 text-right text-sm ${figure.total ? "font-bold text-[#f4d18a]" : "font-medium text-white"}`}>{figure.value}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#c1d3c8]">{report.figureNote}</p>
                  </section>
                )}
                <section className="mt-7" aria-labelledby="priorities-title">
                  <h3 id="priorities-title" className="font-serif text-2xl">Worth a conversation</h3>
                  <div className="mt-4 space-y-3">
                    {report.objectives.map((objective, index) => (
                      <article key={`${objective.key}-${index}`} className="rounded-2xl border border-[#e1e7dc] bg-white/70 p-4" data-testid={`card-objective-${objective.key}`}>
                        <p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#b45b43]">{objective.top ? "Your top priority" : objective.identified ? "Something to explore" : "On your list"}</p>
                        <h4 className="mt-1 font-semibold text-[#27434b]">{objective.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-[#687a77]">{objective.description}</p>
                      </article>
                    ))}
                  </div>
                </section>
                <div className="mt-7 flex flex-col gap-3 border-t border-[#e5e9df] pt-6 sm:flex-row sm:items-center">
                  <ActionButton onClick={() => void downloadReport()} disabled={downloadBusy} testId="button-download-report"><Download size={16} /> {downloadBusy ? "Preparing PDF…" : "Download my report"}</ActionButton>
                  <button type="button" onClick={restart} className="inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-semibold text-[#287568] hover:text-[#174e46]" data-testid="button-start-over">Start a new check-in <ChevronRight size={16} /></button>
                </div>
                {downloadError && <p role="alert" className="mt-4 rounded-xl bg-[#f9e9e2] p-3 text-sm leading-5 text-[#9f4937]" data-testid="status-download-error">{downloadError}</p>}
              </div>
            )}
        </div>
      </section>
    </main>
  );
}
