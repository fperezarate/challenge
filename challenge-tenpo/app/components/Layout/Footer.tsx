import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
        <Link href="/" className="flex items-center" aria-label="Tenpo - Inicio">
          <Image
            src="/images/logo.png"
            alt="Tenpo"
            width={80}
            height={24}
            className="h-6 w-auto"
          />
        </Link>
        <p className="text-center text-sm text-muted-foreground">
          Panel de transacciones · Challenge Tenpo
        </p>
      </div>
    </footer>
  );
}
