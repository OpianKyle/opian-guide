import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { useSubmitContactMessage } from "@workspace/api-client-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const topics = [
  "General enquiry",
  "Financial planning",
  "Provider enquiry",
  "Website support",
  "Other",
] as const;

export default function ContactUs() {
  const submitMessage = useSubmitContactMessage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<(typeof topics)[number]>("General enquiry");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSent(false);

    try {
      await submitMessage.mutateAsync({
        data: { fullName: fullName.trim(), email: email.trim(), topic, message: message.trim(), website },
      });
      setSent(true);
      setFullName("");
      setEmail("");
      setTopic("General enquiry");
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

  return (
    <main className="min-h-[100dvh] bg-[#f7f6ef] text-[#1b2a4a]">
      <header className="border-b border-[#d8dfdc] bg-[#f7f6ef]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-5 sm:px-8">
          <Link href="/" aria-label="MyIFA home">
            <Logo className="text-xl" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#405b62] transition hover:text-[#172d43]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to MyIFA
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <section className="pt-2">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#527869]">
            We’re here to help
          </p>
          <h1 className="max-w-lg font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Contact MyIFA
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#66777d]">
            Send our team a message and we’ll get back to you by email. Please don’t include
            account passwords or sensitive financial or identity documents.
          </p>

          <div className="mt-8 space-y-5">
            <a
              href="mailto:info@myifa.co.za"
              className="inline-flex items-center gap-3 rounded-xl border border-[#d8dfdc] bg-white/75 px-4 py-3 text-sm font-semibold text-[#1b2a4a] transition hover:border-[#9bb4a4]"
            >
              <Mail className="h-4 w-4 text-[#527869]" aria-hidden="true" />
              info@myifa.co.za
            </a>
            <div className="flex max-w-md items-start gap-3 text-sm leading-6 text-[#66777d]">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#527869]" aria-hidden="true" />
              <p>
                Your details are sent to MyIFA so we can respond to this enquiry. We don’t use
                this form to collect financial assessments or documents.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e4e2d8] bg-white p-6 shadow-[0_18px_50px_rgba(23,45,67,.07)] sm:p-9">
          <h2 className="font-serif text-2xl text-[#1b2a4a]">Send us a message</h2>
          <p className="mt-2 text-sm leading-6 text-[#66777d]">
            All fields are required. We’ll reply to the email address you provide.
          </p>

          {sent && (
            <div role="status" className="mt-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">Your message has been sent.</p>
                <p className="mt-1">The MyIFA team will reply by email.</p>
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Full name</Label>
              <Input
                id="contact-name"
                autoComplete="name"
                maxLength={120}
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Email address</Label>
              <Input
                id="contact-email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-topic">What is your message about?</Label>
              <select
                id="contact-topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value as (typeof topics)[number])}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {topics.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                required
                minLength={10}
                maxLength={5000}
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="How can we help?"
                className="resize-y"
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

            <p className="text-xs leading-5 text-[#777c79]">
              By sending this form, you ask MyIFA to use these details to respond to your enquiry.
            </p>

            <Button
              type="submit"
              disabled={submitMessage.isPending}
              className="h-12 w-full bg-[#172d43] text-white hover:bg-[#254e68] sm:w-auto sm:min-w-52"
            >
              {submitMessage.isPending ? "Sending…" : "Send message"}
              {!submitMessage.isPending && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
            </Button>
          </form>
        </section>
      </div>

      <footer className="border-t border-[#d8dfdc] py-6 text-center text-xs text-[#66777d]">
        © 2026 MyIFA · <a href="mailto:info@myifa.co.za" className="underline underline-offset-2">info@myifa.co.za</a>
      </footer>
    </main>
  );
}
