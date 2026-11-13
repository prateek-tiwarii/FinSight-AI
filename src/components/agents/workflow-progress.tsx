"use client";
import { CheckCircle2, Clock3, Loader2, XCircle, AlertTriangle, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WorkflowStage } from "@/lib/workflow";
import { cn } from "@/lib/utils";

const iconFor = (status: WorkflowStage["status"]) => {
  switch (status) {
    case "completed": return CheckCircle2;
    case "running": return Loader2;
    case "failed": return XCircle;
    case "partial": return AlertTriangle;
    case "awaiting": return UserRound;
    default: return Clock3;
  }
};

const badgeFor = (status: WorkflowStage["status"]) => {
  switch (status) {
      case "completed": return <Badge variant="success">Completed</Badge>;
    case "running": return <Badge variant="default">Running</Badge>;
    case "failed": return <Badge variant="destructive">Failed</Badge>;
    case "partial": return <Badge variant="warning">Partial</Badge>;
    case "awaiting": return <Badge variant="warning">Awaiting input</Badge>;
    default: return <Badge variant="outline">Pending</Badge>;
  }
};

export function WorkflowProgress({ stages }: { stages: WorkflowStage[] }) {
  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle>Multi-agent workflow</CardTitle>
        <CardDescription>Status reflects available backend workflow/state fields for this analysis thread. Intermediate streaming is not fabricated.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map((s) => {
          const Icon = iconFor(s.status);
          const active = s.status === "running" || s.status === "awaiting";
          return (
            <div key={s.key} className={cn("rounded-sm border p-4 flex items-start gap-3 transition-all duration-300", active ? "border-gold/40 bg-gold/5" : "border-line bg-ivory/40")}>
              <Icon className={cn("h-5 w-5 mt-0.5", s.status === "running" && "animate-spin text-gold", s.status === "completed" && "text-sage", s.status === "failed" && "text-red-700", s.status === "partial" && "text-gold", s.status === "awaiting" && "text-gold", s.status === "pending" && "text-muted-foreground")} />
              <div className="min-w-0">
                <div className="font-medium text-sm">{s.label}</div>
                <div className="mt-1">{badgeFor(s.status)}</div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
