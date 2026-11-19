import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Mail, ShieldCheck } from "lucide-react";
import { useSubmitContactMessage } from "@workspace/api-client-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const priorities = [
  "Provide for my family if I pass away",
  "Cover funeral costs for me and my family",
  "Keep an income if I can't work",
  "Be covered if I get a serious illness",
  "Make sure my debts are paid off",
  "Save for my children's education",
  "Build an emergency fund",
  "Plan for retirement",
  "Leave an inheritance and plan my estate",
] as const;
type Priority = (typeof priorities)[number];

export default function ContactUs() {
  const submitMessage = useSubmitContactMessage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSent(false);

    if (selectedPriorities.length === 0) {
      setError("Choose at least one priority so we can direct your enquiry.");
      return;
    }

    try {
      await submitMessage.mutateAsync({
        data: {
          fullName: fullName.trim(),
          email: email.trim(),
          topic: "Financial planning",
          priorities: selectedPriorities,
          message: message.trim(),
          website,
        },
      });
      setSent(true);
      setFullName("");
      setEmail("");
      setSelectedPriorities([]);
      setMessage("");
      setWebsite("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We could not send your message. Please try again.",
      );
    }
  };

  const togglePriority = (priority: Priority) => {
    setSelectedPriorities((current) =>
      current.includes(priority)
        ? current.filter((item) => item !== priority)
        : [...current, priority],
    );
    setError("");
  };

  return (
    <main
      className="relative min-h-[100dvh] overflow-hidden bg-[#172b45] text-[#1b2a4a]"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(18, 35, 56, .94) 0%, rgba(18, 35, 56, .82) 48%, rgba(18, 35, 56, .60) 100%), url("${import.meta.env.BASE_URL}personal-toolkit-people-background.jpg")`,
        backgroundPosition: "center 42%",
        backgroundSize: "cover",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#14263d]/10 via-transparent to-[#111f33]/70"
      />

      <header className="relative z-10 border-b border-white/15 bg-[#14263d]/30 text-white backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 sm:px-8">
          <Link href="/" aria-label="MyIFA home" className="text-white">
            <Logo className="text-xl" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to MyIFA
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-9 px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[calc(100dvh-145px)] lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-16 lg:py-12">
        <section className="max-w-xl pt-2 text-white lg:pb-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[#e2c36d]">
            Thoughtful advice starts here
          </p>
          <h1 className="max-w-xl font-serif text-4xl leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.65rem]">
            Let’s plan for what matters most.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
            Tell us a little about the future you want to protect. Our team will be in touch to
            help you take the next step.
          </p>

          <div className="mt-8 space-y-5">
            <a
              href="mailto:info@myifa.co.za"
              className="inline-flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:bg-white/15"
            >
              <Mail className="h-4 w-4 text-[#e2c36d]" aria-hidden="true" />
              info@myifa.co.za
            </a>
            <div className="flex max-w-md items-start gap-3 text-sm leading-6 text-white/75">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#e2c36d]" aria-hidden="true" />
              <p>
                Your details are only used to respond to your enquiry. Please don’t include
                passwords or sensitive identity documents.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.4rem] border border-white/70 bg-[#fffefa]/[.97] p-6 shadow-[0_24px_80px_rgba(8,20,35,.28)] sm:p-8 lg:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9a7629]">
                A good place to begin
              </p>
              <h2 className="font-serif text-2xl text-[#1b2a4a] sm:text-[1.8rem]">
                Start a conversation
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#687486]">
                Choose what matters to you and leave us a message. We’ll reply by email.
              </p>
            </div>
            <span className="rounded-full border border-[#e4dcc8] bg-[#f6f1e5] px-3 py-1.5 text-xs font-semibold text-[#7e662e]">
              No obligation
            </span>
          </div>

          <p className="mt-5 text-xs leading-5 text-[#737d89]">
            Fields marked <span className="font-semibold text-[#a65d3a]">*</span> are required.
          </p>

          {sent && (
            <div role="status" className="mt-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">Your message has been sent.</p>
                <p className="mt-1">The MyIFA team will reply by email.</p>
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Full name <span className="text-[#a65d3a]">*</span></Label>
                <Input
                  id="contact-name"
                  autoComplete="name"
                  maxLength={120}
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="h-12 border-[#d7d4cd] bg-white focus-visible:ring-[#a98a40]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">Email address <span className="text-[#a65d3a]">*</span></Label>
                <Input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 border-[#d7d4cd] bg-white focus-visible:ring-[#a98a40]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p id="contact-priorities-label" className="text-sm font-medium text-[#1b2a4a]">
                Which of these are important to you? <span className="text-[#a65d3a]">*</span>
              </p>
              <details className="group relative">
                <summary
                  aria-labelledby="contact-priorities-label"
                  aria-describedby="contact-priorities-help"
                  aria-required="true"
                  className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-md border border-[#d7d4cd] bg-white px-3.5 py-2.5 text-sm text-[#1b2a4a] shadow-sm outline-none transition hover:border-[#ab965f] focus-visible:ring-2 focus-visible:ring-[#a98a40] [&::-webkit-details-marker]:hidden"
                >
                  <span className={selectedPriorities.length ? "font-medium" : "text-[#818995]"}>
                    {selectedPriorities.length
                      ? `${selectedPriorities.length} ${selectedPriorities.length === 1 ? "priority" : "priorities"} selected`
                      : "Choose one or more priorities"}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-[#7b8290] transition group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 max-h-72 overflow-y-auto rounded-xl border border-[#e1ddd3] bg-white p-2 shadow-[0_18px_38px_rgba(27,42,74,.16)]">
                  {priorities.map((priority, index) => (
                    <label
                      key={priority}
                      htmlFor={`contact-priority-${index}`}
                      className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-sm leading-5 text-[#344158] transition hover:bg-[#f5f2ea]"
                    >
                      <input
                        id={`contact-priority-${index}`}
                        type="checkbox"
                        checked={selectedPriorities.includes(priority)}
                        onChange={() => togglePriority(priority)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#907027]"
                      />
                      <span>{priority}</span>
                    </label>
                  ))}
                </div>
              </details>
              <p id="contact-priorities-help" className="text-xs leading-5 text-[#78818d]">
                Select all that apply.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">Message <span className="text-[#a65d3a]">*</span></Label>
              <Textarea
                id="contact-message"
                required
                minLength={10}
                maxLength={5000}
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Tell us anything else you’d like us to know."
                className="resize-y border-[#d7d4cd] bg-white focus-visible:ring-[#a98a40]"
              />
            </div>

            <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
              <Label htmlFor="contact-website">Leave this field blank</Label>
              <Input
                id="contact-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </div>

            <p className="text-xs leading-5 text-[#737d89]">
              By sending this form, you ask MyIFA to use these details to respond to your enquiry.
            </p>

            <Button
              type="submit"
              disabled={submitMessage.isPending}
              className="h-12 w-full bg-[#1b2a4a] text-white shadow-sm transition hover:bg-[#2c4568] sm:w-auto sm:min-w-52"
            >
              {submitMessage.isPending ? "Sending…" : "Send message"}
              {!submitMessage.isPending && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
            </Button>
          </form>
        </section>
      </div>

      <footer className="relative z-10 border-t border-white/15 bg-[#14263d]/35 py-5 text-center text-xs text-white/70 backdrop-blur-sm">
        © 2026 MyIFA · <a href="mailto:info@myifa.co.za" className="underline underline-offset-2 hover:text-white">info@myifa.co.za</a>
      </footer>
    </main>
  );
}
