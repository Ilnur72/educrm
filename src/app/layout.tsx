import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/SessionProvider";
import "./globals.css";

const geist = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "EduCRM — O'quv markaz",
  description: "O'quv markaz boshqaruv tizimi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className={`${geist.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
