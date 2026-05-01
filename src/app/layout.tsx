import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/SessionProvider";
import { generateBrandCssVars } from "@/lib/brand";
import "./globals.css";

const geist = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

const appName    = process.env.NEXT_PUBLIC_APP_NAME    ?? "EduCRM";
const appTagline = process.env.NEXT_PUBLIC_APP_TAGLINE ?? "O'quv markaz boshqaruv tizimi";
const brandColor = process.env.NEXT_PUBLIC_BRAND_COLOR ?? "#534AB7";

export const metadata: Metadata = {
  title: `${appName} — O'quv markaz`,
  description: appTagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const brandCss = generateBrandCssVars(brandColor);

  return (
    <html lang="uz">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root { ${brandCss} }` }} />
      </head>
      <body className={`${geist.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
