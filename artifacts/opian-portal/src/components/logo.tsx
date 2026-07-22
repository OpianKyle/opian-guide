interface LogoProps {
  className?: string;
  /** dark = white background context (sidebar); light = for use on white/light surfaces */
  variant?: "dark" | "light";
}

export function Logo({ className = "", variant = "dark" }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="MyIFA Financial Services"
      className={`object-contain ${variant === "dark" ? "brightness-0 invert" : ""} ${className}`}
    />
  );
}
