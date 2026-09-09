import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate({ data: { email, password } }, {
      onSuccess: () => setLocation("/"),
      onError: () => setError("Invalid email or password. Please try again."),
    });
  };

  return (
    <div className="min-h-[100dvh] flex">
      {/* Left panel — brand visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1E5EAC] via-[#1a4f94] to-[#0f3060] flex-col items-center justify-center p-12 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E07820]/20 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-[#2E8B57]/15 rounded-full" />

        {/* Content */}
        <div className="relative z-10 text-center">
          <img
            src="/logo.png"
            alt="MyIFA Financial Services"
            className="h-20 mx-auto mb-8 drop-shadow-xl"
          />
          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Command Centre
          </h2>
          <p className="text-white/70 text-base max-w-xs mx-auto leading-relaxed">
            Secure administrative access for MyIFA Financial Services management.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-[#E07820]">30</div>
              <div className="text-white/60 text-xs mt-1">Day Campaigns</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#E07820]">360°</div>
              <div className="text-white/60 text-xs mt-1">Client View</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#E07820]">100%</div>
              <div className="text-white/60 text-xs mt-1">Secure</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.png" alt="MyIFA Financial Services" className="h-14 mx-auto" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your admin account</p>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="admin@myifa.co.za"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full mt-2" disabled={login.isPending}>
                {login.isPending ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Authorized personnel only. All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
