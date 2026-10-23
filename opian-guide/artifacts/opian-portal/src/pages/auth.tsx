import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Loader2, MailCheck } from "lucide-react";
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

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading) {
      if (adminUser) setLocation("/admin/dashboard");
      else if (user) setLocation("/dashboard");
    }
  }, [user, adminUser, authLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    setMode((m) => (m === "login" ? "signup" : "login"));
    setVerificationPending(false);
    setVerificationCode("");
    setVerificationMessage(null);
    setError(null);
    setName("");
    setEmail("");
    setPassword("");
  };

  const hintText = verificationPending
    ? "Enter the 6-digit code we emailed to finish creating your account."
    : mode === "signup"
      ? "Create your account to access your policies and appointments."
      : "Use your email address and password to sign in.";

  return (
    <div className="min-h-screen bg-sidebar flex flex-col font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/8 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Back to home */}
      <div className="relative z-10 p-6">
        <Link href="/">
          <button className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
        </Link>
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Logo className="text-xl" />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl shadow-black/20">
            {/* Heading */}
            <h1 className="text-white font-semibold text-xl text-center mb-1">
              {verificationPending ? "Check your email" : mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-white/40 text-sm text-center mb-6">
              {verificationPending ? "Verify your email address" : mode === "login" ? "Sign in to access your portal" : "Join MyIFAPortal today"}
            </p>

            {verificationPending && (
              <div className="flex justify-center mb-4 text-primary">
                <MailCheck className="h-8 w-8" aria-hidden="true" />
              </div>
            )}

            {/* Hint */}
            <AnimatePresence mode="wait">
              <motion.p
                key={mode}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="text-white/35 text-xs text-center mb-6 leading-snug"
              >
                {hintText}
              </motion.p>
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {mode === "signup" && !verificationPending && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5">
                      <Label className="text-white/60 text-xs font-medium">Full Name</Label>
                      <Input
                        type="text"
                        placeholder="Kyle Heynes"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 h-11"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs font-medium">Email Address</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  readOnly={verificationPending}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 h-11"
                />
              </div>

              {verificationPending ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="verification-code" className="text-white/60 text-xs font-medium">Email verification code</Label>
                    <Input
                      id="verification-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 h-12 text-center text-xl tracking-[0.45em]"
                    />
                  </div>
                  {verificationMessage && (
                    <p className="text-primary/90 text-sm text-center" role="status">{verificationMessage}</p>
                  )}
                </>
              ) : (
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs font-medium">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    required
                    minLength={mode === "signup" ? 8 : 1}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-destructive/15 border border-destructive/30 text-destructive-foreground rounded-lg px-4 py-3 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11 text-base mt-2 shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : verificationPending ? (
                  "Verify email"
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-5 text-center">
              {verificationPending ? (
                <div className="space-y-3">
                  <p className="text-white/30 text-sm">
                    Didn&apos;t receive the email?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending || isSubmitting}
                      className="text-primary hover:text-primary/80 font-medium disabled:opacity-50"
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
                    className="text-white/40 hover:text-white/70 text-sm"
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-white/30 text-sm">
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
