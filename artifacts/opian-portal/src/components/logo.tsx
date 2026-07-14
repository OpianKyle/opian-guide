interface LogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}

/**
 * MyIFAPortal wordmark. Renders as a gold monogram mark + navy/white text,
 * designed for use on the app's dark navy surfaces (sidebar, nav, auth card).
 */
export function Logo({ className = "", markClassName = "", textClassName = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-[#C9A52A] to-[#a9871f] h-9 w-9 shrink-0 ${markClassName}`}
      >
        <span className="font-serif font-bold text-[#0d1b35] text-lg leading-none">M</span>
      </div>
      <span className={`font-serif font-bold text-white text-lg leading-none tracking-tight ${textClassName}`}>
        MyIFA<span className="text-[#C9A52A]">Portal</span>
      </span>
    </div>
  );
}
