import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {
  return <textarea className={cn("flex min-h-[80px] w-full rounded-sm border border-line bg-ivory px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/50 focus-visible:border-gold/40 disabled:cursor-not-allowed disabled:opacity-50 transition-colors", className)} ref={ref} {...props} />;
});
Textarea.displayName = "Textarea";
