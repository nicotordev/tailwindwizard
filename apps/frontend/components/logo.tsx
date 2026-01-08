import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LogoProps {
  href?: string;
  includeText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: "h-6 w-6", text: "text-sm" },
  md: { container: "h-8 w-8", text: "text-base" },
  lg: { container: "h-10 w-10", text: "text-xl" },
};

export default function Logo({
  href = "/",
  includeText = true,
  size = "md",
  className,
}: LogoProps) {
  const sizes = sizeMap[size];

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2 rounded-md outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      aria-label="TailwindWizard home"
    >
      <div className={cn("relative", sizes.container)}>
        <Image
          src="/icons/logo.png"
          alt="TailwindWizard logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <span
        className={cn(
          "font-bold tracking-tight",
          sizes.text,
          includeText ? "block" : "sr-only"
        )}
      >
        Tailwind<span className="text-primary">Wizard</span>
      </span>
    </Link>
  );
}
