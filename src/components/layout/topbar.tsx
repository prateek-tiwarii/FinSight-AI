"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LogOut, Menu, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/portfolio", label: "My Portfolio" },
  { href: "/analysis", label: "Analysis" },
  { href: "/report", label: "Reports" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About FinSight AI" },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Topbar({ variant = "dashboard" }: { variant?: "landing" | "dashboard" }) {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const landing = variant === "landing";
  const {
    status,
    me,
    user,
    openAuth,
    logout,
    openConversion,
  } = useAuth();

  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [accountOpen]);

  const accountArea = (
    <div className="flex items-center gap-2">
      {status === "loading" && (
        <span className={cn("h-8 w-20 rounded-sm animate-pulse", landing ? "bg-ivory/10" : "bg-charcoal/10")} />
      )}
      {status === "anonymous" && (
        <>
          <Button
            size="sm"
            variant={landing ? "outline" : "ghost"}
            className={cn("gap-2", landing && "border-ivory/20 text-ivory hover:bg-ivory/5 bg-transparent")}
            onClick={() => openAuth("login")}
          >
            <UserRound className="h-4 w-4" /> Sign in
          </Button>
          <Button
            size="sm"
            className={cn("hidden sm:inline-flex", landing && "bg-ivory text-charcoal hover:bg-cream")}
            onClick={() => openAuth("register")}
          >
            Create account
          </Button>
        </>
      )}
      {status === "guest" && (
        <>
          <Badge variant="warning" className="font-mono">Guest</Badge>
          <Button
            size="sm"
            variant="outline"
            className={cn(landing && "border-ivory/20 text-ivory hover:bg-ivory/5 bg-transparent")}
            onClick={() => openAuth("register")}
          >
            Save your work
          </Button>
        </>
      )}
      {status === "authenticated" && user && (
        <div className="relative" ref={accountRef}>
          <button
            onClick={() => setAccountOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            className={cn(
              "flex items-center gap-2 rounded-sm border px-2 py-1.5 text-sm transition-colors",
              landing
                ? "border-ivory/15 text-ivory hover:bg-ivory/5"
                : "border-line text-charcoal hover:bg-cream",
            )}
          >
            <span className="h-6 w-6 rounded-sm bg-gold/15 border border-gold/30 text-gold text-[10px] font-mono flex items-center justify-center">
              {initials(user.full_name) || "AI"}
            </span>
            <span className="hidden sm:block max-w-[10rem] truncate">{user.full_name}</span>
          </button>
          {accountOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 border border-line bg-ivory text-charcoal shadow-lg z-40"
            >
              <div className="px-4 py-3 border-b border-line">
                <div className="text-sm font-medium truncate">{user.full_name}</div>
                <div className="text-xs text-charcoal/60 truncate">{user.email}</div>
              </div>
              {me?.guest_conversion_available && (
                <button
                  role="menuitem"
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-cream text-charcoal"
                  onClick={() => {
                    setAccountOpen(false);
                    openConversion();
                  }}
                >
                  Merge guest work
                </button>
              )}
              <button
                role="menuitem"
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-cream text-charcoal inline-flex items-center gap-2"
                onClick={async () => {
                  setAccountOpen(false);
                  await logout();
                }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className={cn("no-print sticky top-0 z-30 backdrop-blur transition-colors", landing ? "bg-ink/80 border-b border-ivory/10 text-ivory" : "bg-cream/90 border-b border-line text-charcoal")}>
      <div className="flex items-center justify-between gap-3 px-4 md:px-8 h-16">
        <div className="flex items-center gap-4 min-w-0">
          <button className={cn("md:hidden p-2 rounded-sm border", landing ? "border-ivory/15 hover:bg-ivory/5" : "border-line hover:bg-cream")} onClick={() => setOpen(v=>!v)} aria-label="Toggle navigation"><Menu className="h-4 w-4" /></button>
          {landing ? (
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-8 rounded-sm border border-gold/40 bg-gold/10 flex items-center justify-center"><BarChart3 className="h-4 w-4 text-gold" /></div>
              <span className="font-serif text-lg tracking-tight">FinSight AI</span>
            </Link>
          ) : (
            <div className="hidden lg:block text-xs font-mono uppercase tracking-[0.18em] text-charcoal/60">Agentic AI Portfolio Intelligence Platform</div>
          )}
          {landing && (
            <nav className="hidden lg:flex items-center gap-5 ml-4 text-sm">
              {nav.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return <Link key={item.href} href={item.href} className={cn("transition-colors hover:text-ivory whitespace-nowrap", active ? "text-ivory" : "text-stone/70")}>{item.label}</Link>;
              })}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("text-[11px] font-mono hidden xl:block", landing ? "text-stone/60" : "text-charcoal/50")}>yfinance (latest available) · Google News RSS</div>
          {accountArea}
        </div>
      </div>
      {open && (
        <div className={cn("md:hidden border-t p-2", landing ? "border-ivory/10 bg-ink" : "border-line bg-cream")}>
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return <Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={cn("block px-3 py-2 rounded-sm text-sm", active ? (landing ? "bg-ivory/10 text-ivory" : "bg-charcoal/5 text-charcoal") : (landing ? "text-stone/80" : "text-charcoal/70"))}>{item.label}</Link>;
          })}
        </div>
      )}
    </header>
  );
}
