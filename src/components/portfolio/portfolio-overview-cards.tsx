"use client";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/formatters";
import type { PortfolioSummary } from "@/types/api";
import { cn } from "@/lib/utils";

function MetricCard({ title, value, sub, tone }: { title: string; value: string; sub?: string; tone?: "pos"|"neg"|"neutral" }) {
  return (
    <Card className="print-surface">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground mb-1">{title}</div>
        <div className={cn("text-2xl font-serif", tone === "pos" && "text-sage", tone === "neg" && "text-[#9a5a4a]")}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export function PortfolioOverviewCards({ summary }: { summary: PortfolioSummary | null | undefined }) {
  if (!summary) return null;
  const pnl = summary.total_absolute_pnl;
  const pct = summary.overall_percentage_return;
  const tone = pnl == null ? "neutral" : pnl >= 0 ? "pos" : "neg";
  const total =
    summary.total_holdings_count ??
    summary.analyzed_holdings_count + summary.unresolved_or_failed_holdings_count;
  const priced = summary.priced_holdings_count ?? summary.analyzed_holdings_count;
  const needsAttention = summary.unresolved_or_failed_holdings_count;
  const partial = summary.is_partial ?? needsAttention > 0;
  const breakdown = [
    summary.missing_price_holdings_count ? `${summary.missing_price_holdings_count} missing price` : null,
    summary.unresolved_holdings_count ? `${summary.unresolved_holdings_count} unresolved` : null,
    summary.failed_holdings_count ? `${summary.failed_holdings_count} failed` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total invested"
          value={formatCurrency(summary.total_invested_amount)}
          sub={partial && summary.analyzed_invested_amount != null ? `Valued basis: ${formatCurrency(summary.analyzed_invested_amount)}` : undefined}
        />
        <MetricCard title="Current portfolio value" value={formatCurrency(summary.total_current_value)} sub={partial ? "Priced holdings only" : undefined} />
        <MetricCard title="Absolute P&L" value={formatCurrency(summary.total_absolute_pnl)} sub={formatPercent(pct)} tone={tone as any} />
        <MetricCard title="Overall return" value={formatPercent(summary.overall_percentage_return)} sub={partial ? "Priced holdings only" : undefined} tone={tone as any} />
        <MetricCard title="Analyzed holdings" value={`${formatNumber(priced, 0)} / ${formatNumber(total, 0)}`} sub="Holdings with a usable price" />
        <MetricCard
          title="Needs attention"
          value={formatNumber(needsAttention, 0)}
          sub={breakdown || (needsAttention ? "Review holdings table" : "All analyzed")}
          tone={needsAttention ? "neg" : "neutral"}
        />
      </div>
      {partial && summary.valuation_note && (
        <p className="text-xs text-[#8a6d3b] bg-gold/10 border border-gold/30 rounded-sm px-3 py-2">
          {summary.valuation_note}
        </p>
      )}
    </div>
  );
}
