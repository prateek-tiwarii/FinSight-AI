"use client";

import { usePathname } from "next/navigation";
import { Loader2, LockKeyhole, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

const PUBLIC_PATHS = ["/", "/about", "/how-it-works"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status, openAuth, continueAsGuest } = useAuth();
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(path)),
  );

  if (isPublic) return <>{children}</>;

  if (status === "loading") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking your session…
      </div>
    );
  }

  if (status === "anonymous") {
    return (
      <div className="max-w-2xl mx-auto py-10 animate-fade-up">
        <div className="border border-line bg-ivory p-6 md:p-8 space-y-5">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-gold">Account required</div>
          <h1 className="font-serif text-3xl md:text-4xl leading-tight">
            Sign in or continue as a guest to use FinSight AI.
          </h1>
          <p className="text-sm text-charcoal/70 leading-relaxed">
            Accounts keep your portfolios, analysis history, and immutable report snapshots.
            Guest mode lets you explore immediately, and you can merge guest work into an
            account later without losing it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => openAuth("login")} className="gap-2">
              <LockKeyhole className="h-4 w-4" /> Sign in
            </Button>
            <Button onClick={() => openAuth("register")} variant="outline" className="gap-2">
              <UserRound className="h-4 w-4" /> Create account
            </Button>
            <Button
              onClick={async () => {
                try {
                  await continueAsGuest();
                } catch (err: any) {
                  toast.error(err?.message || "Could not start a guest session.");
                }
              }}
              variant="ghost"
              className="gap-2"
            >
              Continue as guest
            </Button>
          </div>
          <p className="text-[11px] text-charcoal/50">
            Guest sessions last up to 7 days and have portfolio/analysis limits.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
