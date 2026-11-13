"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { DeveloperFooter } from "@/components/layout/developer-footer";
import { AuthGate } from "@/components/auth/auth-gate";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { GuestConversionDialog } from "@/components/auth/guest-conversion-dialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return (
      <div className="min-h-screen flex flex-col bg-ink text-ivory texture-grain">
        <Topbar variant="landing" />
        <main className="flex-1">{children}</main>
        <DeveloperFooter />
        <AuthDialog />
        <GuestConversionDialog />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-cream text-charcoal">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar variant="dashboard" />
        <main className="flex-1 p-4 md:p-6 lg:p-10 animate-fade-in">
          <AuthGate>{children}</AuthGate>
        </main>
        <DeveloperFooter />
      </div>
      <AuthDialog />
      <GuestConversionDialog />
    </div>
  );
}
