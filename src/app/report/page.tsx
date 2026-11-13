"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { listReports } from "@/lib/api";
import { formatDate } from "@/lib/formatters";

export default function ReportIndexPage() {
  const { status } = useAuth();
  const reportsQuery = useQuery({
    queryKey: ["reports"],
    queryFn: listReports,
    enabled: status === "guest" || status === "authenticated",
  });
  const reports = reportsQuery.data?.reports ?? [];

  return (
    <div className="space-y-6 max-w-5xl animate-fade-up">
      <div className="border-b border-line pb-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-gold mb-2">Reports</div>
        <h1 className="text-3xl md:text-5xl font-serif tracking-tight">Analysis Reports</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">Immutable snapshots of final portfolio intelligence reports. Saved reports are not recalculated with later prices.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current session report</CardTitle>
          <CardDescription>Reports are available after you complete portfolio analysis and the behavioral questionnaire.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">If you have already run an analysis, open the report viewer to see the synthesized findings, sources, and limitations.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/report/view"><Button>Open current report</Button></Link>
            <Link href="/portfolio?new=1"><Button variant="outline">Start new analysis</Button></Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved reports</CardTitle>
          <CardDescription>Reports saved for this {status === "guest" ? "guest session" : "account"}.</CardDescription>
        </CardHeader>
        <CardContent>
          {reportsQuery.isLoading ? (
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading reports…</div>
          ) : reportsQuery.isError ? (
            <Alert variant="error" title="Could not load reports">{(reportsQuery.error as any)?.message || "Try refreshing the page."}</Alert>
          ) : reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved reports yet. Complete an analysis and questionnaire to generate one.</p>
          ) : (
            <div className="divide-y divide-line">
              {reports.map((report) => (
                <div key={report.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{report.title}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      {report.portfolio_name} · {formatDate(report.created_at)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={report.status === "completed" && !report.is_partial ? "success" : "warning"}>
                      {report.is_partial ? "partial" : report.status}
                    </Badge>
                    <Link href={`/report/view?reportId=${report.id}`}>
                      <Button size="sm" variant="outline" className="gap-2"><FileText className="h-4 w-4" /> Open report</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert variant="info" title="Truthful history">
        Each report preserves the holdings valuation, findings, sources, and limitations available when it was generated. Reopening a historical report never substitutes current market prices.
      </Alert>
    </div>
  );
}
