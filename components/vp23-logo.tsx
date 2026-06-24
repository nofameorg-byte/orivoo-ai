import Image from "next/image";
import Link from "next/link";

type VP23LogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "size-12",
  md: "size-16",
  lg: "size-24",
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
        src="/vp23-logo.png"
        width={1024}
        height={1024}
        alt="VP23"
        priority={size === "lg"}
        className={`${sizeClasses[size]} rounded-xl object-contain shadow-lg shadow-metal-red/20`}
      />
      {showText ? (
        <span className="hidden leading-tight sm:block">
          <span className="block text-sm font-semibold uppercase tracking-[0.28em] text-white">
            VP23
          </span>
        </span>
      ) : null}
    </span>
  );

  return href ? <Link href={href}>{mark}</Link> : mark;
}
