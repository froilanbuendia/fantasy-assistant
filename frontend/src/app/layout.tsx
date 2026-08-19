import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fantasy Dashboard",
  description: "Live draft board for the dynasty superflex league",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="flex gap-4 border-b border-zinc-200 px-6 py-3 text-sm dark:border-zinc-800">
          <Link href="/" className="font-medium text-zinc-950 dark:text-zinc-50">
            Draft Board
          </Link>
          <Link href="/teams" className="font-medium text-zinc-950 dark:text-zinc-50">
            Teams
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
