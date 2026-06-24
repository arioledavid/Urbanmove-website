import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
};

export function Logo({
  variant = "dark",
  className = "h-20 w-auto sm:h-22 lg:h-24",
}: LogoProps) {
  return (
    <Image
      src={variant === "light" ? "/brand/logo-light.svg" : "/brand/logo.svg"}
      alt="Urban Move Logistics"
      width={120}
      height={110}
      priority
      className={className}
    />
  );
}

export function LogoLink({ variant = "dark", className }: LogoProps) {
  return (
    <Link
      href="/"
      className="inline-block shrink-0"
      aria-label="Urban Move Logistics home"
    >
      <Logo variant={variant} className={className} />
    </Link>
  );
}
