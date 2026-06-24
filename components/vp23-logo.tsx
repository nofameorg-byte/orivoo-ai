import Image from "next/image";
import Link from "next/link";

type VP23LogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "h-9 w-28",
  md: "h-12 w-36",
  lg: "h-16 w-48",
};

export function VP23Logo({
  href = "/",
  size = "md",
  showText = true,
  className = "",
}: VP23LogoProps) {
  const mark = (
    <span className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/vp23-logo.svg"
        width={240}
        height={80}
        alt="VP23 Financial"
        priority={size === "lg"}
        className={`${sizeClasses[size]} rounded-xl object-contain shadow-lg shadow-metal-red/20`}
      />
      {showText ? (
        <span className="hidden leading-tight sm:block">
          <span className="block text-sm font-semibold uppercase tracking-[0.28em] text-white">
            VP23
          </span>
          <span className="block text-[0.65rem] uppercase tracking-[0.24em] text-muted">
            Financial
          </span>
        </span>
      ) : null}
    </span>
  );

  return href ? <Link href={href}>{mark}</Link> : mark;
}
