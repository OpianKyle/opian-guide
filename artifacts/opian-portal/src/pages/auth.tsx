import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, User, Briefcase, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, type UserRole } from "@/contexts/auth";

type Mode = "login" | "signup";

export default function Auth() {
  const { user, login, signup, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();

  // Parse ?role= from query string
  const params = new URLSearchParams(search);
  const initialRole = (params.get("role") === "advisor" ? "advisor" : "client") as UserRole;

  const [role, setRole] = useState<UserRole>(initialRole);
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, authLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login(role, email, password);
      } else {
        await signup(role, name, email, password);
      }
      setLocation("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError(null);
    setName("");
    setEmail("");
    setPassword("");
  };

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
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-4">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <span className="font-serif text-2xl font-bold text-white tracking-wider">OPIAN</span>
            <span className="text-primary text-[11px] font-semibold tracking-[0.25em] uppercase">NFS Group</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl shadow-black/20">
            {/* Heading */}
            <h1 className="text-white font-semibold text-xl text-center mb-1">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-white/40 text-sm text-center mb-6">
              {mode === "login"
                ? "Sign in to access your portal"
                : "Join the OPIAN portal today"}
            </p>

            {/* Role toggle */}
            <div className="flex rounded-xl border border-white/10 p-1 mb-6 gap-1">
              {(["client", "advisor"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                    role === r
                      ? "bg-primary text-white shadow-sm"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {r === "client" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Briefcase className="h-4 w-4" />
                  )}
                  {r === "client" ? "Client" : "Advisor"}
                </button>
              ))}
            </div>

            {/* Role hint */}
            <AnimatePresence mode="wait">
              <motion.p
                key={role}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="text-white/35 text-xs text-center mb-6 leading-snug"
              >
                {role === "advisor"
                  ? mode === "signup"
                    ? "Your email must match an existing OPIAN advisor account."
                    : "Sign in with your advisor credentials."
                  : mode === "signup"
                  ? "Create a client account to access your policies and appointments."
                  : "Sign in to view your policies and appointments."}
              </motion.p>
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {mode === "signup" && (
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
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs font-medium">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Error message */}
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
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Toggle login/signup */}
            <div className="mt-5 text-center">
              <span className="text-white/30 text-sm">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                onClick={toggleMode}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
