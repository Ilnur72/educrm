import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers/SessionProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "EduCRM | Professional Education Management",
  description: "Premium o'quv markaz boshqaruv tizimi - talabalar, kurslar, to'lovlar va hisobotlar",
  keywords: ["education", "crm", "management", "learning center"],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-background`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
