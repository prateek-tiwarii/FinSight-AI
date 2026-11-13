import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default"|"secondary"|"success"|"warning"|"destructive"|"outline" }) {
  const variants: Record<string,string> = {
    default: "bg-charcoal/5 text-charcoal border-line",
    secondary: "bg-cream text-charcoal border-line",
    success: "bg-sage/10 text-[#556455] border-sage/30",
    warning: "bg-gold/10 text-[#7a653f] border-gold/30",
    destructive: "bg-red-50 text-red-800 border-red-200",
    outline: "bg-transparent text-muted-foreground border-line",
  };
  return <div className={cn("inline-flex items-center rounded-sm border px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider", variants[variant], className)} {...props} />;
}
