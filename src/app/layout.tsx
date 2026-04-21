import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/SessionProvider";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduCRM — O'quv markaz boshqaruv tizimi",
  description: "Zamonaviy o'quv markaz boshqaruv tizimi. Talabalar, kurslar, to'lovlar va hisobotlarni oson boshqaring.",
  keywords: ["CRM", "o'quv markaz", "talabalar", "kurslar", "ta'lim"],
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
