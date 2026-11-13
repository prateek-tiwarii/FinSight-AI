"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HoldingAnalysis } from "@/types/api";
import { formatCurrency, formatPercent, formatNumber, formatDate, safeText } from "@/lib/formatters";

export function HoldingsTable({ holdings, dataSource, generatedAt }: { holdings: HoldingAnalysis[]; dataSource?: string; generatedAt?: string }) {
  return (
    <Card className="print-surface">
      <CardHeader>
        <CardTitle>Holdings</CardTitle>
        <CardDescription>
          Prices are latest available (not live). Source: {safeText(dataSource, "yfinance")}{generatedAt ? ` · Generated ${formatDate(generatedAt)}` : ""}.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground bg-cream/70">
            <tr>
              <th className="text-left p-3 font-medium">Stock</th>
              <th className="text-right p-3 font-medium">Qty</th>
              <th className="text-right p-3 font-medium">Avg. buy</th>
              <th className="text-right p-3 font-medium">Invested</th>
              <th className="text-right p-3 font-medium">Latest avail. price</th>
              <th className="text-right p-3 font-medium">Current value</th>
              <th className="text-right p-3 font-medium">P&amp;L</th>
              <th className="text-right p-3 font-medium">Return %</th>
              <th className="text-right p-3 font-medium">Allocation</th>
              <th className="text-left p-3 font-medium">Data status</th>
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 && <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">No holdings available.</td></tr>}
            {holdings.map((h, idx) => {
              const pnl = h.absolute_pnl;
              const pos = pnl != null && pnl >= 0;
              const neg = pnl != null && pnl < 0;
              const statusVariant = h.status === "ok" ? "success" : h.status === "error" ? "destructive" : "warning";
              const statusLabel = h.status === "missing_price" ? "missing price" : h.status;
              return (
                <tr key={`${h.input_symbol}-${idx}`} className="border-t border-line">
                  <td className="p-3">
                    <div className="font-medium">{h.resolved_symbol || h.input_symbol}</div>
                    <div className="text-xs text-muted-foreground">{h.company?.company_name || h.input_symbol}{h.sector ? ` · ${h.sector}` : ""}</div>
                  </td>
                  <td className="p-3 text-right">{formatNumber(h.quantity)}</td>
                  <td className="p-3 text-right">{formatCurrency(h.average_purchase_price)}</td>
                  <td className="p-3 text-right">{formatCurrency(h.invested_value)}</td>
                  <td className="p-3 text-right">
                    <div>{formatCurrency(h.latest_price)}</div>
                    {h.historical_data?.points?.length ? <div className="text-xs text-muted-foreground">History: {h.historical_data.points.length} pts</div> : null}
                  </td>
                  <td className="p-3 text-right">{formatCurrency(h.current_value)}</td>
                  <td className={`p-3 text-right font-medium ${pos ? "text-sage" : neg ? "text-[#9a5a4a]" : ""}`}>{formatCurrency(h.absolute_pnl)}</td>
                  <td className={`p-3 text-right font-medium ${pos ? "text-sage" : neg ? "text-[#9a5a4a]" : ""}`}>{formatPercent(h.percentage_return)}</td>
                  <td className="p-3 text-right">{formatPercent(h.allocation_percent)}</td>
                  <td className="p-3">
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                    {h.message && <div className="text-[10px] text-muted-foreground mt-1 max-w-[14rem]">{h.message}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
