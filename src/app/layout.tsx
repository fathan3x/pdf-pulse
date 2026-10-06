import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "cn";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "PDF-Pulse",
  description: "Generate short summary with AI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("antialiased font-sans dark", inter.variable)}
    >
      <body className="dark:bg-neutral-950 dark:text-neutral-50">
        {children}
      </body>
    </html>
  );
}
