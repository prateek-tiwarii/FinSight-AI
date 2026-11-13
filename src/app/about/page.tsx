import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl md:text-5xl font-serif tracking-tight">About FinSight AI</h1>
        <p className="text-muted-foreground mt-2">FinSight AI is an agentic AI portfolio intelligence platform. See Beyond the Numbers. It combines deterministic portfolio analytics with specialized AI agents to produce an evidence-aware report.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>How it works</CardTitle><CardDescription>End-to-end workflow</CardDescription></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ol className="list-decimal pl-5 space-y-2">
            <li><b className="text-charcoal font-medium">Extraction:</b> Upload a Groww screenshot to extract holdings (symbol, quantity, average price) for your review and correction.</li>
            <li><b className="text-charcoal font-medium">Deterministic analytics:</b> Portfolio metrics, allocation, and risk indicators are computed from market data (yfinance, latest available).</li>
            <li><b className="text-charcoal font-medium">Market Analyst:</b> Interprets performance and risks using authoritative metrics and read-only tools.</li>
            <li><b className="text-charcoal font-medium">Research Agent:</b> Gathers recent company developments via Google News RSS and cites sources.</li>
            <li><b className="text-charcoal font-medium">Risk Critic:</b> Challenges unsupported claims, contradictions, concentration and evidence gaps.</li>
            <li><b className="text-charcoal font-medium">Behavioral questionnaire (HITL):</b> You provide investment preferences so analysis can reflect your context.</li>
            <li><b className="text-charcoal font-medium">Behavioral & Final Advisors:</b> Compare preferences to portfolio characteristics and synthesize a comprehensive final report.</li>
          </ol>
        </CardContent>
      </Card>
      <Alert variant="warning" title="Disclaimers & limitations">
        FinSight AI provides read-only portfolio intelligence for informational purposes. It does not execute trades, does not guarantee returns, and does not provide personalized investment advice. Market data may be delayed or incomplete; news is based on RSS metadata/snippets and may not reflect full verification. Always verify important information from original sources.
      </Alert>
    </div>
  );
}
