"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Brain, Compass, FileText, Info, LayoutDashboard, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/portfolio", label: "My Portfolio", icon: PieChart },
  { href: "/analysis", label: "Analysis", icon: Brain },
  { href: "/report", label: "Reports", icon: FileText },
  { href: "/how-it-works", label: "How it works", icon: Compass },
  { href: "/about", label: "About FinSight AI", icon: Info },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="no-print hidden md:sticky md:top-0 md:flex md:h-screen md:w-72 md:shrink-0 md:flex-col md:overflow-y-auto border-r border-ivory/10 bg-charcoal text-ivory">
      <div className="px-6 py-6 border-b border-ivory/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center">
            <BarChart3 className="h-4.5 w-4.5 text-gold" />
          </div>
          <div>
            <div className="font-serif text-xl leading-none tracking-tight">FinSight AI</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-stone/80 mt-1 font-mono">Portfolio Intelligence</div>
          </div>
        </Link>
      </div>
      <nav className="p-3 space-y-1" aria-label="Primary">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-sm border-l-2 px-3 py-2.5 text-sm transition-all duration-200",
                active
                  ? "border-gold bg-ivory/10 text-ivory"
                  : "border-transparent text-stone/80 hover:bg-ivory/5 hover:text-ivory",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-gold" : "text-stone/70")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-5 text-[11px] leading-relaxed text-stone/70 border-t border-ivory/10 font-mono">
        Read-only analysis. No trading or investment execution.
      </div>
    </aside>
  );
}
