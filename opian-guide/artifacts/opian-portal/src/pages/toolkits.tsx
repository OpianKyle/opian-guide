import { useMemo, useState } from "react";
import {
  getListToolkitSubmissionsQueryKey,
  useCreateToolkitSubmission,
  useListToolkitSubmissions,
  type ToolkitSubmission,
} from "@workspace/api-client-react";
import {
  getQuestionOptions,
  getToolkitName,
  getToolkitOptionLabel,
  getToolkitSteps,
  validateToolkitAnswers,
  type ToolkitAnswers,
  type ToolkitKind,
  type ToolkitQuestion,
} from "@workspace/toolkit-core";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth";
import { downloadToolkitPdf } from "@/lib/toolkit-pdf";

const answerText = (answers: ToolkitAnswers, id: string) => {
  const value = answers[id];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
};

function ToolkitField({
  kind,
  question,
  answers,
  setAnswer,
}: {
  kind: ToolkitKind;
  question: ToolkitQuestion;
  answers: ToolkitAnswers;
  setAnswer: (id: string, value: string | number | boolean | string[]) => void;
}) {
  const selected = answers[question.id];
  const options = getQuestionOptions(question, answers);
  if (question.visibleWhen && !question.visibleWhen(answers)) return null;

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-foreground">{question.label}</legend>
      {question.help && <p className="text-sm text-muted-foreground">{question.help}</p>}
      {question.kind === "choice" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setAnswer(question.id, option)}
              aria-pressed={selected === option}
              className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                selected === option
                  ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              {getToolkitOptionLabel(kind, question, option)}
            </button>
          ))}
        </div>
      )}
      {question.kind === "multi" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => {
            const values = Array.isArray(selected) ? selected : [];
            const checked = values.includes(option);
            return (
              <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm hover:bg-muted/30">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) =>
                    setAnswer(question.id, value
                      ? [...values, option]
                      : values.filter((item) => item !== option))
                  }
                />
                <span>{getToolkitOptionLabel(kind, question, option)}</span>
              </label>
            );
          })}
        </div>
      )}
      {["money", "number", "text"].includes(question.kind) && (
        <Input
          type={question.kind === "money" || question.kind === "number" ? "number" : "text"}
          inputMode={question.kind === "money" || question.kind === "number" ? "numeric" : "text"}
          min={question.min}
          max={question.max}
          step={question.kind === "money" ? "1" : undefined}
          value={answerText(answers, question.id)}
          onChange={(event) => setAnswer(question.id, event.target.value)}
          placeholder={question.kind === "money" ? "R 0" : undefined}
          aria-label={question.label}
        />
      )}
      {question.kind === "consent" && (
        <label className="flex items-start gap-3 rounded-lg border border-border p-4 text-sm leading-relaxed">
          <Checkbox
            checked={selected === true}
            onCheckedChange={(value) => setAnswer(question.id, value === true)}
            className="mt-0.5"
          />
          <span>{question.label}</span>
        </label>
      )}
    </fieldset>
  );
}

export default function Toolkits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: submissions = [], isLoading, error } = useListToolkitSubmissions();
  const createSubmission = useCreateToolkitSubmission();
  const [kind, setKind] = useState<ToolkitKind | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<ToolkitAnswers>({});
  const [formError, setFormError] = useState("");
  const [savedSubmission, setSavedSubmission] = useState<ToolkitSubmission | null>(null);
  const steps = useMemo(() => kind ? getToolkitSteps(kind) : [], [kind]);
  const step = steps[stepIndex];

  const setAnswer = (id: string, value: string | number | boolean | string[]) => {
    setAnswers((current) => {
      const next = { ...current, [id]: value };
      if (id === "goals" && Array.isArray(value)
        && typeof next.top === "string" && !value.includes(next.top)) {
        delete next.top;
      }
      return next;
    });
    setFormError("");
  };

  const continueStep = async () => {
    if (!kind || !step) return;
    for (const question of step.fields) {
      if (question.visibleWhen && !question.visibleWhen(answers)) continue;
      const value = answers[question.id];
      const missing = value === undefined || value === "" || value === false
        || (Array.isArray(value) && value.length === 0);
      if (question.required && missing) {
        setFormError(`Please answer: ${question.label}`);
        return;
      }
    }
    if (stepIndex < steps.length - 1) {
      setStepIndex((index) => index + 1);
      return;
    }

    try {
      const validated = validateToolkitAnswers(kind, answers);
      const submission = await createSubmission.mutateAsync({ data: { toolkit: kind, answers: validated } });
      setSavedSubmission(submission);
      await queryClient.invalidateQueries({ queryKey: getListToolkitSubmissionsQueryKey() });
      try {
        await downloadToolkitPdf(submission);
      } catch {
        setFormError("Your answers were saved. The PDF could not be generated, but you can download it from your submissions below.");
      }
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "We could not save your answers. Please try again.");
    }
  };

  const startToolkit = (selectedKind: ToolkitKind) => {
    setKind(selectedKind);
    setStepIndex(0);
    setAnswers({});
    setSavedSubmission(null);
    setFormError("");
  };

  const reset = () => {
    setKind(null);
    setStepIndex(0);
    setAnswers({});
    setSavedSubmission(null);
    setFormError("");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Planning tools</p>
        <h1 className="mt-2 text-3xl font-serif font-bold">Financial toolkits</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Answer a few questions about your personal finances or business. Your report will be available to download and shared securely with your advisor.
        </p>
      </div>

      {!kind ? (
        <div className="grid gap-5 md:grid-cols-2">
          {(["personal", "business"] as const).map((toolkit) => (
            <Card key={toolkit} className="border-border shadow-sm">
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle>{getToolkitName(toolkit)}</CardTitle>
                <CardDescription>
                  {toolkit === "personal"
                    ? "Review your family protection, income, debts, savings and financial priorities."
                    : "Review business continuity, owners, key people, business debts and staff benefits."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => startToolkit(toolkit)}>Start toolkit</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : savedSubmission ? (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
              <div>
                <h2 className="font-semibold text-foreground">Toolkit submitted</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your answers have been shared with the OPIAN team. Your report download should start automatically.
                </p>
                {formError && <p role="alert" className="mt-2 text-sm text-destructive">{formError}</p>}
              </div>
            </div>
            <Button variant="outline" onClick={() => void downloadToolkitPdf(savedSubmission)}>
              <Download className="mr-2 h-4 w-4" /> Download report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{getToolkitName(kind)}</CardTitle>
                <CardDescription className="mt-1">
                  Signed in as {user?.name || "your account"}{user?.email ? ` · ${user.email}` : ""}
                </CardDescription>
              </div>
              <Button type="button" variant="ghost" onClick={reset}>Choose another</Button>
            </div>
            <div className="pt-3">
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>Step {stepIndex + 1} of {steps.length}</span>
                <span>{Math.round(((stepIndex + 1) / steps.length) * 100)}%</span>
              </div>
              <Progress value={((stepIndex + 1) / steps.length) * 100} />
            </div>
          </CardHeader>
          <CardContent className="space-y-7">
            <div>
              <h2 className="text-xl font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{step.intro}</p>
            </div>
            <div className="space-y-7">
              {step.fields.map((question) => (
                <ToolkitField
                  key={question.id}
                  kind={kind}
                  question={question}
                  answers={answers}
                  setAnswer={setAnswer}
                />
              ))}
            </div>
            {formError && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}
            <div className="flex justify-between border-t pt-5">
              <Button
                type="button"
                variant="outline"
                disabled={stepIndex === 0 || createSubmission.isPending}
                onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" disabled={createSubmission.isPending} onClick={() => void continueStep()}>
                {createSubmission.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {stepIndex === steps.length - 1 ? "Submit and get report" : "Continue"}
                {!createSubmission.isPending && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-serif font-bold">Your submitted reports</h2>
          <p className="text-sm text-muted-foreground">Only you and authorised OPIAN staff can see these submissions.</p>
        </div>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading your submissions…</p>
        ) : error ? (
          <p className="text-sm text-destructive">Your previous submissions could not be loaded.</p>
        ) : submissions.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No toolkit reports yet.</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{getToolkitName(submission.toolkit)}</p>
                  <p className="text-sm text-muted-foreground">
                    Submitted {new Date(submission.createdAt).toLocaleDateString("en-ZA")}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void downloadToolkitPdf(submission)}>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
