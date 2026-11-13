"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, History, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAnalysisStore } from "@/hooks/use-analysis-store";
import { useAuth } from "@/providers/auth-provider";
import { getAnalysis, listAnalyses } from "@/lib/api";
import type { AnalysisRunSummary } from "@/types/api";
import { deriveWorkflowStages } from "@/lib/workflow";
import { WorkflowProgress } from "@/components/agents/workflow-progress";
import { PortfolioOverviewCards } from "@/components/portfolio/portfolio-overview-cards";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { AllocationDonut, SectorAllocationChart, PnlByStockChart, HistoricalPerformanceChart } from "@/components/charts/portfolio-charts";
import { AgentFindings } from "@/components/agents/agent-findings";
import { QuestionnairePanel } from "@/components/agents/questionnaire-panel";
import { formatDate } from "@/lib/formatters";

export default function AnalysisPage() {
  const { analysis, setAnalysis, setThreadId } = useAnalysisStore();
  const { status } = useAuth();
  const [loadingRunId, setLoadingRunId] = useState<string | null>(null);
  const analysesQuery = useQuery({
    queryKey: ["analyses"],
    queryFn: listAnalyses,
    enabled: status === "guest" || status === "authenticated",
  });

  const stages = useMemo(() => analysis ? deriveWorkflowStages(analysis as any) : [], [analysis]);

  const openAnalysis = async (run: AnalysisRunSummary) => {
    setLoadingRunId(run.id);
    try {
      const detail = await getAnalysis(run.id);
      if (!detail.analysis) {
        toast.error("This analysis has no stored result snapshot yet.");
        return;
      }
      setAnalysis({
        ...detail.analysis,
        thread_id: detail.thread_id,
        analysis_id: detail.id,
        portfolio_id: detail.portfolio_id,
        report_id: detail.report_id,
      });
      setThreadId(detail.thread_id);
    } catch (err: any) {
      toast.error(err?.message || "Could not load this analysis.");
    } finally {
      setLoadingRunId(null);
    }
  };

  const historyCard = (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><History className="h-4 w-4 text-gold" /> Analysis history</CardTitle>
            <CardDescription>Saved runs for this {status === "guest" ? "guest session" : "account"}.</CardDescription>
          </div>
          <Link href="/portfolio?new=1"><Button size="sm" variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> New analysis</Button></Link>
        </div>
      </CardHeader>
      <CardContent>
        {analysesQuery.isLoading ? (
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading history…</div>
        ) : analysesQuery.isError ? (
          <Alert variant="error" title="Could not load analysis history">{(analysesQuery.error as any)?.message || "Try refreshing the page."}</Alert>
        ) : (analysesQuery.data?.analyses.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No saved analyses yet. Your completed runs will appear here.</p>
        ) : (
          <div className="divide-y divide-line">
            {analysesQuery.data?.analyses.map((run) => (
              <div key={run.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{run.portfolio_name}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">
                    {formatDate(run.created_at)} · {run.status} · {run.workflow_stage || "workflow"}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={run.status === "completed" ? "success" : run.status === "failed" ? "destructive" : "warning"}>{run.status}</Badge>
                  {run.report_id && (
                    <Link href={`/report/view?reportId=${run.report_id}`}><Button size="sm" variant="ghost" className="gap-2"><FileText className="h-4 w-4" /> Report</Button></Link>
                  )}
                  <Button size="sm" variant="outline" onClick={() => void openAnalysis(run)} disabled={loadingRunId !== null} className="gap-2">
                    {loadingRunId === run.id && <Loader2 className="h-4 w-4 animate-spin" />} Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!analysis) {
    return (
      <div className="space-y-6 max-w-5xl animate-fade-up">
        <div className="border-b border-line pb-6"><div className="text-[11px] font-mono uppercase tracking-[0.2em] text-gold mb-2">Analysis</div><h1 className="text-3xl md:text-5xl font-serif tracking-tight">Portfolio Analysis</h1></div>
        <Alert variant="info" title="No analysis in session">Open a saved analysis below, or start by uploading and confirming your portfolio holdings, then run multi-agent analysis.</Alert>
        <div className="flex flex-wrap gap-2">
          <Link href="/portfolio?new=1"><Button>Start a new analysis</Button></Link>
          <Link href="/report"><Button variant="outline">View saved reports</Button></Link>
        </div>
        {historyCard}
      </div>
    );
  }

  const metrics = analysis.portfolio_metrics;
  const awaiting = !!analysis.pending_questionnaire || analysis.analysis_status === "awaiting_user_input";
  const hasFinal = !!analysis.final_report;

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-gold mb-2">Analysis</div>
          <h1 className="text-2xl md:text-4xl font-serif tracking-tight">Portfolio Analysis</h1>
          <p className="text-muted-foreground mt-1">Multi-agent intelligence results for the current session.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {analysis.thread_id && <Badge variant="outline">Thread: {analysis.thread_id.slice(0,8)}…</Badge>}
          <Badge
            variant={
              awaiting
                ? "warning"
                : analysis.analysis_status === "failed"
                  ? "destructive"
                  : analysis.analysis_status === "partial"
                    ? "warning"
                    : analysis.analysis_status === "completed"
                      ? "success"
                      : "secondary"
            }
          >
            {analysis.analysis_status}
          </Badge>
          {hasFinal && <Link href={analysis.report_id ? `/report/view?reportId=${analysis.report_id}` : "/report/view"}><Button size="sm" className="gap-2"><FileText className="h-4 w-4"/>View final report</Button></Link>}
          <Link href="/portfolio?new=1"><Button size="sm" variant="outline" className="gap-2"><RefreshCw className="h-4 w-4"/>New analysis</Button></Link>
        </div>
      </div>

      <details className="border border-line bg-ivory p-4">
        <summary className="cursor-pointer text-sm font-medium flex items-center gap-2"><History className="h-4 w-4 text-gold" /> Analysis history <span className="text-xs text-muted-foreground font-normal">({analysesQuery.data?.analyses.length ?? 0} saved)</span></summary>
        <div className="mt-4">{historyCard}</div>
      </details>

      <WorkflowProgress stages={stages} />

      {analysis.analysis_status === "failed" && <Alert variant="error" title="Analysis failed">The workflow reported a failure. Review warnings below; deterministic metrics or partial findings may still be available.</Alert>}
      {analysis.analysis_status === "partial" && !awaiting && <Alert variant="warning" title="Partial analysis">Some AI stages or holdings could not be completed. Deterministic metrics and any available findings are shown; valuation totals include only holdings with a usable price where noted.</Alert>}
      {awaiting && <Alert variant="warning" title="Action required">Analysis is paused awaiting your behavioral questionnaire responses. Complete the questionnaire below to generate the final report.</Alert>}

      {metrics ? (
        <div className="space-y-8 animate-fade-up">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl mb-4">Portfolio overview</h2>
            <PortfolioOverviewCards summary={metrics.summary} />
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="font-mono">Data source: {metrics.data_source} (latest available, not live)</span>
              <span className="font-mono">Generated: {formatDate(metrics.generated_at)}</span>
            </div>
          </div>

          <HoldingsTable holdings={metrics.holdings || []} dataSource={metrics.data_source} generatedAt={metrics.generated_at} />

          <div className="grid gap-4 lg:grid-cols-2">
            <AllocationDonut holdings={metrics.holdings || []} />
            <SectorAllocationChart sectorAllocation={metrics.summary?.sector_allocation} />
            <PnlByStockChart holdings={metrics.holdings || []} />
            <HistoricalPerformanceChart holdings={metrics.holdings || []} />
          </div>

          {(metrics.risk || metrics.warnings?.length || metrics.limitations?.length) && (
            <Card className="print-surface">
              <CardHeader><CardTitle>Risk metrics & limitations</CardTitle><CardDescription>Deterministic indicators from available historical/price data.</CardDescription></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {metrics.risk && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="border border-line rounded-sm p-3 bg-cream/30"><div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Annualized volatility</div><div className="font-medium mt-1">{metrics.risk.portfolio_volatility_annualized != null ? (metrics.risk.portfolio_volatility_annualized * 100).toFixed(2) + "%" : "Unavailable"}</div></div>
                    <div className="border border-line rounded-sm p-3 bg-cream/30"><div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Max drawdown</div><div className="font-medium mt-1">{metrics.risk.max_drawdown != null ? (metrics.risk.max_drawdown * 100).toFixed(2) + "%" : "Unavailable"}</div></div>
                    <div className="border border-line rounded-sm p-3 bg-cream/30"><div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Top holding concentration</div><div className="font-medium mt-1">{metrics.risk.concentration_top_holding_percent != null ? metrics.risk.concentration_top_holding_percent.toFixed(2) + "%" : "Unavailable"}</div></div>
                    <div className="border border-line rounded-sm p-3 bg-cream/30"><div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">HHI</div><div className="font-medium mt-1">{metrics.risk.concentration_hhi != null ? metrics.risk.concentration_hhi.toFixed(2) : "Unavailable"}</div></div>
                  </div>
                )}
                {metrics.risk?.concentration_note && <p className="text-muted-foreground">{metrics.risk.concentration_note}</p>}
                {metrics.risk?.assumptions?.length ? <div><div className="font-medium mb-1">Assumptions</div><ul className="list-disc pl-5 text-muted-foreground space-y-1">{metrics.risk.assumptions.map((a,i)=><li key={i}>{a}</li>)}</ul></div> : null}
                {metrics.limitations?.length ? <Alert variant="warning" title="Limitations"><ul className="list-disc pl-5 space-y-1">{metrics.limitations.map((w,i)=><li key={i}>{w}</li>)}</ul></Alert> : null}
                {metrics.warnings?.length ? <Alert variant="warning" title="Portfolio data warnings"><ul className="list-disc pl-5 space-y-1">{metrics.warnings.map((w,i)=><li key={i}>{w}</li>)}</ul></Alert> : null}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Alert variant="warning" title="Portfolio metrics unavailable">Deterministic portfolio metrics were not returned for this analysis.</Alert>
      )}

      {awaiting && (
        <QuestionnairePanel
          analysis={analysis}
          onResumed={(data) => { setAnalysis(data); if (data.thread_id) setThreadId(data.thread_id); }}
        />
      )}

      <AgentFindings analysis={analysis} />

      {analysis.tool_execution_summaries?.length ? (
        <Card>
          <CardHeader><CardTitle>Tool execution summaries</CardTitle><CardDescription>Read-only tool calls performed by agents (for transparency).</CardDescription></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground"><tr><th className="text-left p-2">Tool</th><th className="text-left p-2">Status</th><th className="text-left p-2">Call ID</th></tr></thead>
              <tbody>{analysis.tool_execution_summaries.map((t:any,i:number)=>(<tr key={i} className="border-t border-border"><td className="p-2">{t.tool_name||"tool"}</td><td className="p-2">{t.status||"unknown"}</td><td className="p-2 text-muted-foreground">{t.tool_call_id||"-"}</td></tr>))}</tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
