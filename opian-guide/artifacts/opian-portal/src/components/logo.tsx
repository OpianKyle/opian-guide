interface LogoProps {
  className?: string;
  /** dark = white background context (sidebar); light = for use on white/light surfaces */
  variant?: "dark" | "light";
}

export function Logo({ className = "", variant = "dark" }: LogoProps) {
  return (
    <span
      className={`font-serif tracking-widest font-bold select-none ${
        variant === "dark" ? "text-white" : "text-[#1a1a2e]"
      } ${className}`}
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: "0.18em" }}
    >
      MY<span style={{ color: variant === "dark" ? "#f97316" : "#f97316" }}>IFA</span>
    </span>
  );
}
