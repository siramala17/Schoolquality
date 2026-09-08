import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "ระบบนิเทศภายในโรงเรียน",
  description: "ระบบบริหารจัดการและประเมินการนิเทศ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${sarabun.variable} h-full`}>
      <body className="min-h-full font-sans antialiased bg-bg text-text">{children}</body>
    </html>
  );
}
