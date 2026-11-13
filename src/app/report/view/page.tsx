"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Printer, Download, Copy, ArrowLeft, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAnalysisStore } from "@/hooks/use-analysis-store";
import { useAuth } from "@/providers/auth-provider";
import { getReport } from "@/lib/api";
import { PortfolioOverviewCards } from "@/components/portfolio/portfolio-overview-cards";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { AllocationDonut, SectorAllocationChart, PnlByStockChart } from "@/components/charts/portfolio-charts";
import { formatDate, safeText } from "@/lib/formatters";

function SectionList({ title, items, empty = "None reported." }: { title: string; items?: string[]; empty?: string }) {
  return (
    <div>
      <h3 className="font-serif text-xl mb-2">{title}</h3>
      {items && items.length ? (
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

export default function ReportViewPage() {
  const { analysis: sessionAnalysis } = useAnalysisStore();
  const { status } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("reportId");
    if (id) setReportId(id);
  }, []);

  const reportQuery = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => getReport(reportId as string),
    enabled: !!reportId && (status === "guest" || status === "authenticated"),
    retry: false,
  });

  if (reportId && reportQuery.isLoading) {
    return (
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading saved report…</div>
      </div>
    );
  }

  if (reportId && reportQuery.isError) {
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-semibold">Final Report</h1>
        <Alert variant="error" title="Report could not be loaded">{(reportQuery.error as any)?.message || "The report may have been deleted or belongs to another session."}</Alert>
        <div className="flex gap-2">
          <Link href="/report"><Button variant="outline">Back to reports</Button></Link>
          <Link href="/portfolio?new=1"><Button>Start new analysis</Button></Link>
        </div>
      </div>
    );
  }

  const persisted = reportQuery.data;
  const analysis = reportId
    ? persisted
      ? {
          ...persisted.analysis,
          portfolio_metrics: persisted.metrics ?? persisted.analysis.portfolio_metrics,
          research_sources: persisted.analysis.research_sources?.length ? persisted.analysis.research_sources : persisted.sources,
        }
      : null
    : sessionAnalysis;

  if (!analysis) {
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-semibold">Final Report</h1>
        <Alert variant="info" title="No report data">Run and complete an analysis first, or open a saved report from the Reports page.</Alert>
        <div className="flex gap-2">
          <Link href="/report"><Button variant="outline">Saved reports</Button></Link>
          <Link href="/portfolio"><Button>Go to My Portfolio</Button></Link>
        </div>
      </div>
    );
  }

  const report = analysis.final_report;
  const metrics = analysis.portfolio_metrics;

  if (!report) {
    const awaiting = !!analysis.pending_questionnaire || analysis.analysis_status === "awaiting_user_input";
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-semibold">Final Report</h1>
        <Alert variant={awaiting ? "warning" : "info"} title={awaiting ? "Questionnaire required" : "Final report not available"}>
          {awaiting
            ? "The analysis is paused awaiting your behavioral questionnaire responses. Complete the questionnaire in the Analysis page to generate the final report."
            : "A final report has not been generated for this analysis. Review available findings in the Analysis page."}
        </Alert>
        <div className="flex gap-2">
          <Link href="/analysis"><Button>Go to Analysis</Button></Link>
          <Link href="/portfolio"><Button variant="outline">Start new analysis</Button></Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => window.print();

  const handleCopy = async () => {
    const lines: string[] = [];
    lines.push(report.report_title || "FinSight AI Portfolio Analysis Report");
    if (report.generated_at) lines.push(`Generated: ${report.generated_at}`);
    lines.push("\nExecutive Summary\n" + (report.executive_summary || ""));
    lines.push("\nOverall Assessment\n" + (report.overall_assessment || ""));
    if (report.portfolio_strengths?.length) lines.push("\nStrengths:\n- " + report.portfolio_strengths.join("\n- "));
    if (report.portfolio_weaknesses?.length) lines.push("\nWeaknesses:\n- " + report.portfolio_weaknesses.join("\n- "));
    if (report.key_observations?.length) lines.push("\nKey Observations:\n- " + report.key_observations.join("\n- "));
    if (report.areas_requiring_attention?.length) lines.push("\nAreas Requiring Attention:\n- " + report.areas_requiring_attention.join("\n- "));
    if (report.warnings?.length) lines.push("\nWarnings:\n- " + report.warnings.join("\n- "));
    lines.push("\nEducational use only. Not financial, legal, or tax advice.");
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Report summary copied to clipboard.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const el = reportRef.current;
      if (!el) { toast.error("Report content not found."); return; }
      toast.info("Generating PDF...");
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save("finsight-ai-report.pdf");
      toast.success("PDF downloaded.");
    } catch (e) {
      console.error(e);
      toast.error("PDF export failed. You can use Print to save as PDF.");
    }
  };

  const allWarnings = Array.from(new Set([
    ...(report.warnings || []),
    ...(analysis.warnings || []),
    ...(analysis.research_warnings || []),
    ...(metrics?.warnings || []),
  ].filter(Boolean))) as string[];

  const isComplete = analysis.analysis_status === "completed" && analysis.final_advisor_status === "completed";
  const isFailed = analysis.analysis_status === "failed" || analysis.final_advisor_status === "failed";
  const statusBadge = isComplete
    ? { variant: "success" as const, label: "Finalized" }
    : isFailed
      ? { variant: "destructive" as const, label: "Fallback report" }
      : { variant: "warning" as const, label: "Partial report" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between no-print">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight">Final Report</h1>
          <p className="text-muted-foreground mt-1">Comprehensive portfolio intelligence report with findings, risks, and limitations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/analysis"><Button variant="outline" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back to analysis</Button></Link>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}><Copy className="h-4 w-4" />Copy summary</Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}><Printer className="h-4 w-4" />Print</Button>
          <Button size="sm" className="gap-2" onClick={handleDownloadPdf}><Download className="h-4 w-4" />Download PDF</Button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-6 print-surface">
        {!isComplete && (
          <Alert variant={isFailed ? "error" : "warning"} title="Partial analysis">
            {isFailed
              ? "Analysis — This report was produced in fallback mode after one or more AI stages failed. It reflects only available evidence and deterministic metrics; review warnings and limitations before relying on it."
              : "Partial Analysis — Some AI research stages could not be completed. This report reflects only available evidence and deterministic metrics; review warnings and limitations before relying on it."}
          </Alert>
        )}
        <Card className="print-surface">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl">{report.report_title || "FinSight AI Portfolio Analysis Report"}</CardTitle>
                <CardDescription>
                  Generated {formatDate(report.generated_at)}
                  {analysis.thread_id ? ` · Thread ${analysis.thread_id}` : ""}
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant={statusBadge.variant} className="gap-1">
                  {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {statusBadge.label}
                </Badge>
                {analysis.final_advisor_status && <Badge variant="outline">{analysis.final_advisor_status}</Badge>}
                {analysis.analysis_status && <Badge variant="outline">{analysis.analysis_status}</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <section><h3 className="font-serif text-xl mb-2">Executive summary</h3><p className="text-sm text-muted-foreground whitespace-pre-wrap">{safeText(report.executive_summary, "No executive summary available.")}</p></section>
            <section><h3 className="font-serif text-xl mb-2">Overall assessment</h3><p className="text-sm text-muted-foreground whitespace-pre-wrap">{safeText(report.overall_assessment, "No overall assessment available.")}</p></section>
            <div className="grid md:grid-cols-2 gap-6">
              <SectionList title="Portfolio strengths" items={report.portfolio_strengths} />
              <SectionList title="Portfolio weaknesses" items={report.portfolio_weaknesses} />
            </div>
          </CardContent>
        </Card>

        {metrics && (
          <Card className="print-surface">
            <CardHeader><CardTitle>Portfolio summary & metrics</CardTitle><CardDescription>Deterministic metrics (yfinance, latest available). Generated {formatDate(metrics.generated_at)}.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <PortfolioOverviewCards summary={metrics.summary} />
              <div className="grid gap-4 lg:grid-cols-2">
                <AllocationDonut holdings={metrics.holdings || []} />
                <SectorAllocationChart sectorAllocation={metrics.summary?.sector_allocation} />
              </div>
              <HoldingsTable holdings={metrics.holdings || []} dataSource={metrics.data_source} generatedAt={metrics.generated_at} />
              <PnlByStockChart holdings={metrics.holdings || []} />
            </CardContent>
          </Card>
        )}

        <Card className="print-surface">
          <CardHeader><CardTitle>Performance & risk insights</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {report.performance_insights?.length ? (
              <div className="space-y-2">
                <h3 className="font-serif text-xl">Performance insights</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">{report.performance_insights.map((x: any, i: number) => <li key={i}>{safeText(x.insight || x.observation || x.summary, typeof x === "string" ? x : JSON.stringify(x))}</li>)}</ul>
              </div>
            ) : <p className="text-sm text-muted-foreground">No performance insights reported.</p>}
            <div>
              <h3 className="font-serif text-xl mb-2">Risk assessment</h3>
              {report.risk_assessment && Object.keys(report.risk_assessment).length ? (
                <div className="space-y-2 text-sm text-muted-foreground">
                  {report.risk_assessment.summary && <p className="whitespace-pre-wrap">{report.risk_assessment.summary}</p>}
                  {Array.isArray(report.risk_assessment.key_risks) && report.risk_assessment.key_risks.length ? (
                    <ul className="list-disc pl-5 space-y-1">{report.risk_assessment.key_risks.map((x: any, i: number) => <li key={i}>{safeText(x.title || x.description, JSON.stringify(x))}{x.severity ? ` [${x.severity}]` : ""}</li>)}</ul>
                  ) : null}
                  {report.risk_assessment.overall_risk_level && <p><b>Overall risk level:</b> {report.risk_assessment.overall_risk_level}</p>}
                </div>
              ) : <p className="text-sm text-muted-foreground">No risk assessment details available.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="print-surface">
          <CardHeader><CardTitle>Research & behavioral assessment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-serif text-xl mb-2">Research summary</h3>
              {report.research_summary && Object.keys(report.research_summary).length ? (
                <div className="text-sm text-muted-foreground space-y-2">
                  {report.research_summary.overview && <p className="whitespace-pre-wrap">{report.research_summary.overview}</p>}
                  {Array.isArray(report.research_summary.key_developments) && report.research_summary.key_developments.length ? (
                    <ul className="list-disc pl-5 space-y-1">{report.research_summary.key_developments.map((x: any, i: number) => <li key={i}>{safeText(x.headline || x.summary, JSON.stringify(x))}{x.source_name ? ` (${x.source_name})` : ""}</li>)}</ul>
                  ) : null}
                </div>
              ) : <p className="text-sm text-muted-foreground">No research summary available.</p>}
            </div>
            <div>
              <h3 className="font-serif text-xl mb-2">Behavioral assessment</h3>
              {report.behavioral_assessment && Object.keys(report.behavioral_assessment).length ? (
                <div className="text-sm text-muted-foreground space-y-2">
                  {report.behavioral_assessment.overview && <p className="whitespace-pre-wrap">{report.behavioral_assessment.overview}</p>}
                  {Array.isArray(report.behavioral_assessment.observations) && report.behavioral_assessment.observations.length ? (
                    <ul className="list-disc pl-5 space-y-1">{report.behavioral_assessment.observations.map((x: any, i: number) => <li key={i}>{typeof x === "string" ? x : JSON.stringify(x)}</li>)}</ul>
                  ) : null}
                </div>
              ) : <p className="text-sm text-muted-foreground">No behavioral assessment available.</p>}
            </div>
            {report.preference_mismatches?.length ? (
              <div>
                <h3 className="font-serif text-xl mb-2">Preference mismatches</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">{report.preference_mismatches.map((x: any, i: number) => <li key={i}>{safeText(x.description || x.detail || x.area, JSON.stringify(x))}</li>)}</ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="print-surface">
          <CardHeader><CardTitle>Key observations & attention areas</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <SectionList title="Key observations" items={report.key_observations} />
            <SectionList title="Areas requiring attention" items={report.areas_requiring_attention} />
          </CardContent>
        </Card>

        <Card className="print-surface">
          <CardHeader><CardTitle>Critic findings & sources</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {report.critic_findings_summary && Object.keys(report.critic_findings_summary).length ? (
              <div className="text-sm text-muted-foreground space-y-2">
                {report.critic_findings_summary.overview && <p>{report.critic_findings_summary.overview}</p>}
                {Array.isArray(report.critic_findings_summary.top_risks) && report.critic_findings_summary.top_risks.length ? (
                  <ul className="list-disc pl-5 space-y-1">{report.critic_findings_summary.top_risks.map((x: any, i: number) => <li key={i}>{safeText(x.title || x.description, JSON.stringify(x))}</li>)}</ul>
                ) : null}
              </div>
            ) : <p className="text-sm text-muted-foreground">No critic summary available.</p>}
            <div>
              <h3 className="font-serif text-xl mb-2">Supporting sources</h3>
              {(report.supporting_sources?.length || analysis.research_sources?.length) ? (
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {(report.supporting_sources?.length ? report.supporting_sources : analysis.research_sources || []).map((s: any, i: number) => (
                    <li key={i}>
                      {safeText(s.title || s.headline || s.url, "Source")}
                      {s.publisher || s.source_name ? ` • ${s.publisher || s.source_name}` : ""}
                      {s.publication_date ? ` • ${s.publication_date}` : ""}
                      {s.url || s.source_url ? <> — <a className="text-primary underline" href={s.url || s.source_url} target="_blank" rel="noopener noreferrer">open</a></> : ""}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No supporting sources reported.</p>}
            </div>
          </CardContent>
        </Card>

        {allWarnings.length ? (
          <Card className="border-gold/30 print-surface">
            <CardHeader><CardTitle>Warnings & limitations</CardTitle></CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">{allWarnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
            </CardContent>
          </Card>
        ) : null}

        <Card className="print-surface">
          <CardHeader><CardTitle>Disclaimer</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>This report is for educational and informational purposes only. It is not financial, investment, legal, or tax advice, and it does not constitute a recommendation to buy, sell, or hold any security.</p>
            <p>Analysis is based on user-provided holdings, latest available public market data (yfinance), and Google News RSS metadata/snippets. Data may be delayed, incomplete, or unavailable. News metadata does not constitute full-article verification.</p>
            <p>Behavioral insights are based only on user-stated preferences and portfolio characteristics; they are not a psychometric or suitability assessment. Deterministic portfolio metrics remain authoritative over agent narratives when conflicts arise.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
