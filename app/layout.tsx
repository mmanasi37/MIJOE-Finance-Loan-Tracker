import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  weight: ["400", "500", "600", "700"],
});

const firaSans = Fira_Sans({
  subsets: ["latin"],
  variable: "--font-fira-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MIJOE Finance Loan Tracker",
  description: "Secure loan repayment tracking for clients and staff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${firaCode.variable} ${firaSans.variable}`}>
      <body className="min-h-full bg-background antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
