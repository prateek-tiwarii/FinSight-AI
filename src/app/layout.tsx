import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AnalysisProvider } from "@/hooks/use-analysis-store";
import { AuthProvider } from "@/providers/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "sonner";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FinSight AI | Agentic AI Portfolio Intelligence Platform",
  description: "Upload your portfolio. Let AI agents analyze the bigger picture.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable} ${mono.variable} antialiased font-sans`}>
        <QueryProvider>
          <AuthProvider>
            <AnalysisProvider>
              <AppShell>{children}</AppShell>
              <Toaster richColors theme="light" position="top-right" />
            </AnalysisProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
