import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => {
  return <input type={type} className={cn("flex h-10 w-full rounded-sm border border-line bg-ivory px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/50 focus-visible:border-gold/40 disabled:cursor-not-allowed disabled:opacity-50 transition-colors", className)} ref={ref} {...props} />;
});
Input.displayName = "Input";
