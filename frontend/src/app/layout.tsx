import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DraftPicksProvider } from "@/lib/use-draft-picks";
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
        <DraftPicksProvider>{children}</DraftPicksProvider>
      </body>
    </html>
  );
}
