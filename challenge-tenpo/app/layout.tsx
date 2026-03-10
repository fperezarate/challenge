import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Footer } from "@/app/components/Layout/Footer";
import { NavBar } from "@/app/components/Layout/NavBar";
import { Providers } from "@/app/providers";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tenpo — Panel de transacciones",
  description: "Registra y visualiza transacciones de tu cuenta Tenpista.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${openSans.variable} flex min-h-screen flex-col font-sans antialiased`}>
        <Providers>
          <NavBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
