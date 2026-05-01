import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/SessionProvider";
import "./globals.css";

const geist = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "EduCRM";
const appTagline = process.env.NEXT_PUBLIC_APP_TAGLINE ?? "O'quv markaz boshqaruv tizimi";

export const metadata: Metadata = {
  title: `${appName} — O'quv markaz`,
  description: appTagline,
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
