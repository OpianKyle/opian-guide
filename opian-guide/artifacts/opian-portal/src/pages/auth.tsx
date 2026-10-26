import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, LockKeyhole, MailCheck, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";

type Mode = "login" | "signup";

export default function Auth() {
  const { user, adminUser, unifiedLogin, signup, verifyEmail, resendVerification, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (adminUser) setLocation("/admin/dashboard");
      else if (user) setLocation("/dashboard");
    }
  }, [user, adminUser, authLoading, setLocation]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (verificationPending) {
        await verifyEmail(email, verificationCode);
        setLocation("/dashboard");
      } else if (mode === "login") {
        const result = await unifiedLogin(email, password);
        setLocation(result.kind === "admin" ? "/admin/dashboard" : "/dashboard");
      } else {
        await signup("client", name, email, password);
        setPassword("");
        setVerificationCode("");
        setVerificationPending(true);
        setVerificationMessage(`We sent a 6-digit verification code to ${email}. It expires in 10 minutes.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsResending(true);
    try {
      await resendVerification(email);
      setVerificationMessage("If an unverified signup exists for this email, a new code will be sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not resend the code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const toggleMode = () => {
    setMode((current) => current === "login" ? "signup" : "login");
    setVerificationPending(false);
    setVerificationCode("");
    setVerificationMessage(null);
    setError(null);
    setName("");
    setEmail("");
    setPassword("");
  };

  const hintText = verificationPending
    ? "Enter the six-digit code we emailed to finish creating your account."
    : mode === "signup"
      ? "Create a secure client account to access your financial planning workspace."
      : "Sign in with the email address and password associated with your MyIFA account.";

  return (
    <main className="auth-shell relative flex min-h-[100dvh] items-stretch overflow-hidden">
      <div className="auth-photo absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(13,28,49,0.12),rgba(13,28,49,0.03)_55%,rgba(13,28,49,0.22))]" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid min-h-[100dvh] w-full max-w-[1440px] md:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.82fr)]">
        <section className="flex flex-col justify-between px-6 pb-8 pt-7 text-white sm:px-10 md:px-14 md:py-10 lg:px-20">
          <div className="flex items-center justify-between gap-4">
            <Logo className="text-xl sm:text-2xl" />
            <span className="hidden items-center gap-2 text-xs font-medium tracking-wide text-white/70 sm:inline-flex">
              <ShieldCheck className="h-4 w-4 text-[#d7b34b]" aria-hidden="true" />
              Secure client workspace
            </span>
          </div>

          <div className="max-w-[620px] pb-5 pt-14 md:pb-20 md:pt-0">
            <p className="auth-kicker mb-5 text-[10px] font-semibold uppercase sm:text-xs">
              MYIFA FINANCIAL SERVICES
            </p>
            <h1 className="max-w-[590px] font-serif text-[2.65rem] leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-[4.15rem]">
              A clearer view of your financial future.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/78 sm:text-base sm:leading-8">
              Your secure place to continue financial planning, connect with your advisor, and keep important account details close at hand.
            </p>
            <div className="mt-8 hidden max-w-md items-center gap-4 border-l border-[#d7b34b]/70 pl-4 text-sm leading-6 text-white/75 md:flex">
              <LockKeyhole className="h-5 w-5 shrink-0 text-[#d7b34b]" aria-hidden="true" />
              <span>Your account is protected. Only you can access your personal workspace.</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 border-t border-white/20 pt-5 text-xs text-white/65">
            <p>MyIFA Financial Services · OPIAN Advisor Portal</p>
            <Link href="/fna" className="auth-link inline-flex shrink-0 items-center gap-1.5 font-medium text-white/85 transition-colors hover:text-white" data-testid="link-financial-assessment">
              Financial needs assessment <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 pb-7 sm:px-8 sm:pb-10 md:px-8 md:py-10 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
            className="auth-paper w-full max-w-[480px] rounded-[1.35rem] border border-[#e6dfd0] px-6 py-7 sm:px-9 sm:py-9 lg:px-11 lg:py-10"
          >
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7746]">Client &amp; advisor access</p>
                <p className="mt-1 text-xs text-[#777365]">OPIAN secure sign-in</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5dcc8] bg-[#f5f0e4] text-[#8b7746]" aria-hidden="true">
                {verificationPending ? <MailCheck className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
              </div>
            </div>

            <h2 className="font-serif text-[1.8rem] leading-tight tracking-[-0.025em] text-[#1b2a4a] sm:text-[2rem]" data-testid="text-auth-heading">
              {verificationPending ? "Check your email" : mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#716f66]" data-testid="text-auth-description">
              {verificationPending
                ? "Verify your email address to finish setting up secure access."
                : mode === "login"
                  ? "Sign in to continue to your MyIFA workspace."
                  : "Join MyIFA to access your policies and appointments."}
            </p>
            <p className="mt-4 border-l-2 border-[#c9a52a] pl-3 text-xs leading-5 text-[#777365]" data-testid="text-auth-guidance">
              {hintText}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-label={verificationPending ? "Verify email" : mode === "login" ? "Sign in" : "Create client account"}>
              <AnimatePresence initial={false}>
                {mode === "signup" && !verificationPending && (
                  <motion.div
                    key="signup-name"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-1.5"
                  >
                    <Label htmlFor="auth-name" className="text-xs font-semibold text-[#4f514f]">Full name</Label>
                    <Input
                      id="auth-name"
                      data-testid="input-name"
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      required
                      className="auth-form-input h-12 rounded-lg"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label htmlFor="auth-email" className="text-xs font-semibold text-[#4f514f]">Email address</Label>
                <Input
                  id="auth-email"
                  data-testid="input-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  readOnly={verificationPending}
                  required
                  className="auth-form-input h-12 rounded-lg"
                />
              </div>

              {verificationPending ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="verification-code" className="text-xs font-semibold text-[#4f514f]">Email verification code</Label>
                    <Input
                      id="verification-code"
                      data-testid="input-verification-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      className="auth-form-input h-12 rounded-lg text-center text-xl tracking-[0.45em]"
                    />
                  </div>
                  {verificationMessage && <p className="rounded-lg bg-[#f2eedf] px-3 py-2.5 text-sm leading-5 text-[#655a3e]" role="status" data-testid="status-verification">{verificationMessage}</p>}
                </>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-password" className="text-xs font-semibold text-[#4f514f]">Password</Label>
                  <div className="relative">
                    <Input
                      id="auth-password"
                      data-testid="input-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={mode === "signup" ? "At least 8 characters" : "Enter your password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      required
                      minLength={mode === "signup" ? 8 : 1}
                      className="auth-form-input h-12 rounded-lg pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="auth-icon-button absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[#777365] transition-colors hover:bg-[#f2eedf] hover:text-[#1b2a4a]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg border border-[#c87870]/40 bg-[#f8e9e6] px-3.5 py-3 text-sm leading-5 text-[#813d37]"
                    role="alert"
                    data-testid="status-auth-error"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-12 w-full rounded-lg bg-[#1b2a4a] text-sm font-semibold text-white shadow-md shadow-[#1b2a4a]/15 transition-colors hover:bg-[#26395e] focus-visible:ring-2 focus-visible:ring-[#c9a52a] focus-visible:ring-offset-2"
                data-testid="button-auth-submit"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2" role="status">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" aria-hidden="true" />
                    {verificationPending ? "Verifying…" : mode === "login" ? "Signing in…" : "Creating account…"}
                  </span>
                ) : verificationPending ? "Verify email" : mode === "login" ? "Sign in securely" : "Create client account"}
              </Button>
            </form>

            <div className="mt-5 text-center">
              {verificationPending ? (
                <div className="space-y-3">
                  <p className="text-sm text-[#777365]">
                    Didn&apos;t receive the email?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending || isSubmitting}
                      className="auth-link font-semibold text-[#806a2e] hover:text-[#5f4d20] disabled:opacity-55"
                      data-testid="button-resend-verification"
                    >
                      {isResending ? "Sending…" : "Resend code"}
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationPending(false);
                      setVerificationCode("");
                      setVerificationMessage(null);
                      setError(null);
                    }}
                    className="auth-link text-sm text-[#777365] underline decoration-[#b7ad99] underline-offset-4 hover:text-[#1b2a4a]"
                    data-testid="button-change-email"
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[#777365]">
                  {mode === "login" ? "New to MyIFA? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="auth-link font-semibold text-[#806a2e] hover:text-[#5f4d20]"
                    data-testid="button-toggle-mode"
                  >
                    {mode === "login" ? "Create a client account" : "Sign in"}
                  </button>
                </p>
              )}
            </div>

            <div className="mt-7 flex items-center justify-center gap-2 border-t border-[#e5dfd2] pt-5 text-[11px] leading-5 text-[#898579]">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#9e8543]" aria-hidden="true" />
              <span>Private financial information is protected in this secure workspace.</span>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
