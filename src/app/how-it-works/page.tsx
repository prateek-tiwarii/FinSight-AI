import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const stages = [
  {
    title: "Upload & extract",
    detail:
      "Upload a Groww portfolio screenshot (PNG, JPG, JPEG, WEBP, up to 10 MB). Gemini extracts symbols, quantities, and average purchase prices for review.",
  },
  {
    title: "Review & confirm",
    detail:
      "Every extracted holding must be reviewed and explicitly confirmed. Uncertain symbols are surfaced instead of being silently accepted.",
  },
  {
    title: "Deterministic portfolio analytics",
    detail:
      "Invested value, current value, P&L, allocation, volatility, drawdown, and concentration are computed from market data. Only priced holdings contribute to totals, and partial valuations are labelled.",
  },
  {
    title: "Market Analyst agent",
    detail:
      "A market analyst interprets the deterministic metrics, stock-level performance, sector mix, and risk observations. It may call read-only market-data tools.",
  },
  {
    title: "Research agent",
    detail:
      "Recent company developments are gathered from Google News RSS. Sources, publication dates, limitations, and missing-news warnings are kept with the research findings.",
  },
  {
    title: "Risk Critic agent",
    detail:
      "A critic challenges unsupported claims, looks for contradictions and missing evidence, and classifies identified risks by severity.",
  },
  {
    title: "Behavioral questionnaire",
    detail:
      "The workflow pauses for your investment horizon, risk tolerance, objective, reaction to drawdowns, and experience. This is human-in-the-loop context, not a suitability assessment.",
  },
  {
    title: "Behavioral Advisor agent",
    detail:
      "Stated preferences are compared with observable portfolio characteristics. Mismatches and educational observations are reported without making personalized recommendations.",
  },
  {
    title: "Final Advisor synthesis",
    detail:
      "The final advisor combines metrics, research, critic findings, and behavioral context into a structured portfolio intelligence report with warnings and limitations.",
  },
  {
    title: "Saved history & immutable reports",
    detail:
      "Portfolios, analysis runs, and completed reports are stored in PostgreSQL. Report snapshots are written once and are never recalculated with later prices, so history remains truthful.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl space-y-8 animate-fade-up">
      <div className="border-b border-line pb-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-gold mb-2">How it works</div>
        <h1 className="text-3xl md:text-5xl font-serif tracking-tight">
          A ten-stage, evidence-aware portfolio workflow
        </h1>
        <p className="text-muted-foreground mt-3 max-w-3xl leading-relaxed">
          FinSight AI separates deterministic portfolio math from AI interpretation. Numbers are
          calculated first, agents reason over those numbers and cited sources, and the workflow
          pauses for your preferences before producing a final report.
        </p>
      </div>

      <div className="grid gap-3">
        {stages.map((stage, index) => (
          <Card key={stage.title} className="border-line">
            <CardContent className="p-5 flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-sm border border-gold/40 bg-gold/10 text-gold font-mono text-sm flex items-center justify-center">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <h2 className="font-serif text-xl">{stage.title}</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{stage.detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What FinSight AI does not do</CardTitle>
          <CardDescription>Read-only intelligence with explicit limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {[
            "It does not execute trades or connect to a brokerage account.",
            "It does not provide guaranteed returns, personalized investment advice, or a suitability assessment.",
            "It does not treat delayed market data or RSS news snippets as complete verification.",
            "It does not recalculate an old report using today's prices. Each saved report preserves the data available when it was generated.",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-sage mt-0.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Alert variant="warning" title="Data, privacy, and accounts">
        Portfolio data and report snapshots are stored only for the signed-in account or temporary
        guest session that created them. Guest sessions expire, and guest work can be merged into
        an account with explicit confirmation. Uploaded screenshots are processed for extraction
        and are not exposed to other users.
      </Alert>

      <div className="flex flex-wrap gap-3">
        <Link href="/portfolio">
          <Button className="gap-2">
            Start with your portfolio <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/about">
          <Button variant="outline">About FinSight AI</Button>
        </Link>
      </div>
    </div>
  );
}
