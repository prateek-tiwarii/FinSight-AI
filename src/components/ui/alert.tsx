import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Alert({ variant = "info", title, children, className }: { variant?: "info"|"success"|"warning"|"error"; title?: string; children?: React.ReactNode; className?: string }) {
  const styles = {
    info: "border-line bg-cream/70 text-charcoal",
    success: "border-sage/30 bg-sage/10 text-charcoal",
    warning: "border-gold/30 bg-gold/10 text-charcoal",
    error: "border-red-200 bg-red-50/80 text-red-900",
  } as const;
  const Icon = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle }[variant];
  return (
    <div className={cn("rounded-sm border p-4 text-sm flex gap-3 animate-fade-in", styles[variant], className)}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0 opacity-80" />
      <div>
        {title && <div className="font-medium mb-0.5 font-serif text-base">{title}</div>}
        <div className="text-sm/6 text-inherit opacity-90">{children}</div>
      </div>
    </div>
  );
}
