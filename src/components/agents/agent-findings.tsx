"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import type { AgentAnalyzeResponse } from "@/types/api";
import { safeText } from "@/lib/formatters";

function List({ items, empty = "None reported." }: { items?: string[]; empty?: string }) {
  if (!items || items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return <ul className="list-disc pl-5 space-y-1 text-sm">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;
}

function SeverityBadge({ severity }: { severity: string }) {
  const v = (severity || "").toLowerCase();
  const variant = v === "critical" || v === "high" ? "destructive" : v === "medium" ? "warning" : "secondary";
  return <Badge variant={variant as any}>{severity || "unknown"}</Badge>;
}

export function AgentFindings({ analysis }: { analysis: AgentAnalyzeResponse }) {
  const m = analysis.analyst_findings;
  const r = analysis.research_findings;
  const c = analysis.critic_findings;
  const b = analysis.behavioral_findings;

  return (
    <div className="space-y-6">
      <Card className="print-surface">
        <CardHeader><CardTitle>Market Analyst</CardTitle><CardDescription>Evidence-based interpretation using deterministic portfolio metrics and market data tools.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {!m ? <p className="text-sm text-muted-foreground">Market analyst findings not available.</p> : (
            <>
              <div><div className="text-sm font-medium mb-1">Portfolio overview</div><p className="text-sm text-muted-foreground whitespace-pre-wrap">{m.portfolio_overview}</p></div>
              <div><div className="text-sm font-medium mb-1">Key findings</div><List items={m.key_findings} /></div>
              <div><div className="text-sm font-medium mb-1">Stock-level insights</div>
                {m.stock_level_insights?.length ? <div className="space-y-2">{m.stock_level_insights.map((s: any, i: number) => (<div key={i} className="rounded-md border border-line p-3 text-sm"><div className="font-medium">{safeText(s.symbol, "Stock")}</div><div className="text-muted-foreground"><b>Observation:</b> {safeText(s.observation, "")}</div>{s.interpretation && <div className="text-muted-foreground"><b>Interpretation:</b> {s.interpretation}</div>}</div>))}</div> : <p className="text-sm text-muted-foreground">None reported.</p>}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><div className="text-sm font-medium mb-1">Sector observations</div><List items={m.sector_observations} /></div>
                <div><div className="text-sm font-medium mb-1">Risk observations</div><List items={m.risk_observations} /></div>
              </div>
              {m.warnings?.length ? <Alert variant="warning" title="Analyst warnings"><List items={m.warnings} /></Alert> : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="print-surface">
        <CardHeader><CardTitle>Research Agent</CardTitle><CardDescription>Company/news developments from Google News RSS metadata (read-only). Headlines/snippets and metadata may be incomplete.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {!r ? <p className="text-sm text-muted-foreground">Research findings not available. {analysis.research_status ? `Status: ${analysis.research_status}.` : ""}</p> : (
            <>
              <div><div className="text-sm font-medium mb-1">Research overview</div><p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.research_overview}</p></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><div className="text-sm font-medium mb-1">Positive signals</div><List items={r.positive_signals} /></div>
                <div><div className="text-sm font-medium mb-1">Negative signals</div><List items={r.negative_signals} /></div>
                <div><div className="text-sm font-medium mb-1">Neutral observations</div><List items={r.neutral_observations} /></div>
                <div><div className="text-sm font-medium mb-1">Potential concerns</div><List items={r.potential_concerns} /></div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Important developments & sources</div>
                {r.important_developments?.length ? <div className="space-y-2">{r.important_developments.map((d: any, i: number) => (
                  <div key={i} className="rounded-md border border-line p-3 text-sm space-y-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="font-medium">{safeText(d.headline, "Development")}</span>{d.sentiment && <Badge variant="outline">{d.sentiment}</Badge>}</div>
                    {d.summary && <div className="text-muted-foreground">{d.summary}</div>}
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                      <span>Company: {safeText(d.related_company)}</span>
                      <span>Publisher: {safeText(d.source_name)}</span>
                      <span>Date: {safeText(d.publication_date)}</span>
                    </div>
                    {d.why_it_may_matter && <div className="text-xs text-muted-foreground"><b>Why it may matter:</b> {d.why_it_may_matter}</div>}
                    {d.evidence_or_limitation_notes && <div className="text-xs text-[#7a653f]"><b>Evidence/limitations:</b> {d.evidence_or_limitation_notes}</div>}
                    {d.source_url ? <a href={d.source_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs">Open source</a> : <span className="text-xs text-muted-foreground">Source URL unavailable</span>}
                  </div>
                ))}</div> : <p className="text-sm text-muted-foreground">No important developments reported.</p>}
                {(analysis.research_sources?.length || 0) > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium mb-1 text-muted-foreground">Retrieved source metadata</div>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">{analysis.research_sources.map((s: any, i: number) => (<li key={i}>{safeText(s.title, "Source")} {s.publisher ? `· ${s.publisher}` : ""} {s.publication_date ? `· ${s.publication_date}` : ""} {s.url ? <a className="text-primary underline" href={s.url} target="_blank" rel="noopener noreferrer">link</a> : ""}</li>))}</ul>
                  </div>
                )}
              </div>
              <Alert variant="info" title="Source limitation">News results are based on Google News RSS metadata/snippets and are not full-article verification. Dates or details may be missing.</Alert>
              {(r.warnings?.length || analysis.research_warnings?.length) ? <Alert variant="warning" title="Research warnings"><List items={[...(r.warnings || []), ...(analysis.research_warnings || [])]} /></Alert> : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="print-surface">
        <CardHeader><CardTitle>Risk Critic</CardTitle><CardDescription>Independent challenge of claims, evidence gaps, contradictions, and risk severity.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {!c ? <p className="text-sm text-muted-foreground">Risk critic findings not available.</p> : (
            <>
              <div><div className="text-sm font-medium mb-1">Critic overview</div><p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.critic_overview}</p></div>
              <div><div className="text-sm font-medium mb-2">Identified risks</div>
                {c.identified_risks?.length ? <div className="space-y-2">{c.identified_risks.map((rsk: any, i: number) => (<div key={i} className="rounded-md border border-line p-3 text-sm"><div className="flex items-center justify-between gap-2"><div className="font-medium">{rsk.title}</div><SeverityBadge severity={rsk.severity} /></div><div className="text-muted-foreground mt-1">{rsk.description}</div>{rsk.reasoning_summary && <div className="text-xs text-muted-foreground mt-1"><b>Reasoning:</b> {rsk.reasoning_summary}</div>}{rsk.related_stock_or_sector && <div className="text-xs text-muted-foreground mt-1">Related: {rsk.related_stock_or_sector}</div>}</div>))}</div> : <p className="text-sm text-muted-foreground">No risks identified.</p>}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><div className="text-sm font-medium mb-1">Challenged claims</div>
                  {c.challenged_claims?.length ? <ul className="space-y-2 text-sm">{c.challenged_claims.map((cc: any, i: number) => (<li key={i} className="border border-line rounded-md p-2"><div className="font-medium">{cc.claim}</div>{cc.reasoning && <div className="text-muted-foreground text-xs mt-1">{cc.reasoning}</div>}</li>))}</ul> : <p className="text-sm text-muted-foreground">None reported.</p>}
                </div>
                <div><div className="text-sm font-medium mb-1">Contradictions & missing evidence</div>
                  {c.contradictions?.length ? <ul className="list-disc pl-5 text-sm space-y-1 mb-2">{c.contradictions.map((x: any, i: number) => <li key={i}>{safeText(x.description, JSON.stringify(x))}</li>)}</ul> : <p className="text-sm text-muted-foreground mb-2">No contradictions reported.</p>}
                  <List items={c.missing_evidence} empty="No missing evidence listed." />
                </div>
              </div>
              {c.recommendations_for_report?.length ? <div><div className="text-sm font-medium mb-1">Recommendations for report</div><List items={c.recommendations_for_report} /></div> : null}
              {c.warnings?.length ? <Alert variant="warning" title="Critic warnings"><List items={c.warnings} /></Alert> : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="print-surface">
        <CardHeader><CardTitle>Behavioral Advisor</CardTitle><CardDescription>Educational comparison of stated preferences with portfolio characteristics (not a psychometric or suitability assessment).</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {!b ? <p className="text-sm text-muted-foreground">Behavioral findings not available yet. {analysis.pending_questionnaire ? "Complete the questionnaire to continue." : ""}</p> : (
            <>
              <div><div className="text-sm font-medium mb-1">Overview</div><p className="text-sm text-muted-foreground whitespace-pre-wrap">{b.behavioral_overview}</p></div>
              {b.profile?.stated_preferences && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  {Object.entries(b.profile.stated_preferences as any).filter(([k]) => k !== "additional_context").map(([k, v]) => (
                    <div key={k} className="border border-line rounded-md p-2"><div className="text-xs text-muted-foreground">{k.replaceAll("_", " ")}</div><div className="font-medium">{String(v)}</div></div>
                  ))}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div><div className="text-sm font-medium mb-1">Areas of conflict / mismatches</div>
                  {(b.areas_of_conflict?.length || b.profile?.mismatch_indicators?.length) ? <ul className="list-disc pl-5 text-sm space-y-1">{[...(b.areas_of_conflict || []), ...(b.profile?.mismatch_indicators || [])].map((x: any, i: number) => <li key={i}>{safeText(x.description || x.detail || x.area, JSON.stringify(x))}</li>)}</ul> : <p className="text-sm text-muted-foreground">No strong mismatches detected from available indicators.</p>}
                </div>
                <div><div className="text-sm font-medium mb-1">Potential behavioral risks</div>
                  {b.potential_behavioral_risks?.length ? <ul className="list-disc pl-5 text-sm space-y-1">{b.potential_behavioral_risks.map((x: any, i: number) => <li key={i}>{safeText(x.risk || x.description, JSON.stringify(x))}</li>)}</ul> : <p className="text-sm text-muted-foreground">None reported.</p>}
                </div>
              </div>
              {b.recommendations_educational?.length ? <div><div className="text-sm font-medium mb-1">Educational observations</div><List items={b.recommendations_educational} /></div> : null}
              {b.warnings?.length ? <Alert variant="warning" title="Behavioral warnings"><List items={b.warnings} /></Alert> : null}
            </>
          )}
        </CardContent>
      </Card>

      {analysis.warnings?.length ? <Alert variant="warning" title="Workflow warnings"><List items={analysis.warnings} /></Alert> : null}
    </div>
  );
}
