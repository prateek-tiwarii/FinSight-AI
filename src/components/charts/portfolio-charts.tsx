"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import type { HoldingAnalysis } from "@/types/api";

const COLORS = ["#282926", "#B89A64", "#7A8F7A", "#D7CDB8", "#1A1917", "#8a7b5e", "#5f6b5f", "#c8bfae"];
const axis = { fill: "#6b6b66", fontSize: 11, fontFamily: "var(--font-mono)" };

function Empty({ label }: { label: string }) {
  return <div className="h-64 flex items-center justify-center text-sm text-muted-foreground border border-dashed border-line rounded-sm bg-cream/40 font-mono text-xs px-4 text-center">{label}</div>;
}

export function AllocationDonut({ holdings }: { holdings: HoldingAnalysis[] }) {
  const data = holdings
    .filter((h) => (h.allocation_percent ?? 0) > 0)
    .map((h) => ({ name: h.resolved_symbol || h.input_symbol, value: Number(h.allocation_percent || 0) }));
  if (!data.length) return <Card><CardHeader><CardTitle>Portfolio allocation</CardTitle><CardDescription>By holding (current allocation %)</CardDescription></CardHeader><CardContent><Empty label="No allocation data available." /></CardContent></Card>;
  return (
    <Card className="print-surface">
      <CardHeader><CardTitle>Portfolio allocation</CardTitle><CardDescription>By holding (current allocation %)</CardDescription></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} stroke="#F9F6EE">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)}%`} contentStyle={{ background: "#F9F6EE", border: "1px solid #DED8CC", borderRadius: 2, fontFamily: "var(--font-mono)", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SectorAllocationChart({ sectorAllocation }: { sectorAllocation: Record<string, number> | null | undefined }) {
  const data = Object.entries(sectorAllocation || {}).map(([name, value]) => ({ name, value: Number(value) })).filter((d) => d.value > 0);
  if (!data.length) return <Card><CardHeader><CardTitle>Sector allocation</CardTitle><CardDescription>Current value distribution by sector</CardDescription></CardHeader><CardContent><Empty label="No sector allocation data available." /></CardContent></Card>;
  return (
    <Card className="print-surface">
      <CardHeader><CardTitle>Sector allocation</CardTitle><CardDescription>Current value distribution by sector (%)</CardDescription></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DED8CC" />
            <XAxis type="number" tick={axis} unit="%" />
            <YAxis type="category" dataKey="name" tick={axis} width={120} />
            <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)}%`} contentStyle={{ background: "#F9F6EE", border: "1px solid #DED8CC", borderRadius: 2 }} />
            <Bar dataKey="value" fill="#282926" radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PnlByStockChart({ holdings }: { holdings: HoldingAnalysis[] }) {
  const data = holdings
    .filter((h) => h.absolute_pnl != null)
    .map((h) => ({ name: h.resolved_symbol || h.input_symbol, pnl: Number(h.absolute_pnl || 0) }));
  if (!data.length) return <Card><CardHeader><CardTitle>P&amp;L by stock</CardTitle><CardDescription>Absolute profit/loss per holding</CardDescription></CardHeader><CardContent><Empty label="No P&L data available." /></CardContent></Card>;
  return (
    <Card className="print-surface">
      <CardHeader><CardTitle>P&amp;L by stock</CardTitle><CardDescription>Absolute profit/loss per holding (currency units)</CardDescription></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DED8CC" />
            <XAxis dataKey="name" tick={{ ...axis, fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={54} />
            <YAxis tick={axis} />
            <Tooltip formatter={(v: any) => Number(v).toFixed(2)} contentStyle={{ background: "#F9F6EE", border: "1px solid #DED8CC", borderRadius: 2 }} />
            <Bar dataKey="pnl">
              {data.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? "#7A8F7A" : "#9a5a4a"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

type PriceSeries = { name: string; input: string; points: { date: string; close: number }[] };

function movingAverage(points: { date: string; close: number }[], window = 20) {
  return points.map((p, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = points.slice(start, i + 1);
    const avg = slice.reduce((sum, x) => sum + x.close, 0) / slice.length;
    return { ...p, avg20: Number(avg.toFixed(4)) };
  });
}

function formatTickDate(value: string) {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value.slice(5);
  return dt.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export function HistoricalPerformanceChart({ holdings }: { holdings: HoldingAnalysis[] }) {
  const series = useMemo<PriceSeries[]>(
    () =>
      holdings
        .map((h) => ({
          name: h.resolved_symbol || h.input_symbol,
          input: h.input_symbol,
          points: (h.historical_data?.points || [])
            .filter((p) => p.close != null)
            .map((p) => ({ date: String(p.date), close: Number(p.close) })),
        }))
        .filter((s) => s.points.length > 1),
    [holdings],
  );
  const [selected, setSelected] = useState<string | null>(null);

  if (!series.length) {
    return (
      <Card>
        <CardHeader><CardTitle>Historical price (single stock)</CardTitle><CardDescription>Historical close prices where available</CardDescription></CardHeader>
        <CardContent><Empty label="No historical time series available from API response." /></CardContent>
      </Card>
    );
  }

  const active = series.find((s) => s.name === selected) || [...series].sort((a, b) => b.points.length - a.points.length)[0];
  const data = movingAverage(active.points);
  const first = active.points[0]?.close;
  const last = active.points[active.points.length - 1]?.close;
  const periodReturn = first ? ((last - first) / first) * 100 : null;
  const newHigh = Math.max(...active.points.map((p) => p.close));
  const newLow = Math.min(...active.points.map((p) => p.close));

  return (
    <Card className="print-surface">
      <CardHeader className="gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Historical price — {active.name}</CardTitle>
            <CardDescription>
              Close price over the selected period for this single holding (not whole-portfolio performance).
            </CardDescription>
          </div>
          {series.length > 1 && (
            <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <span className="sr-only">Select holding</span>
              <select
                value={active.name}
                onChange={(event) => setSelected(event.target.value)}
                className="mt-1 block rounded-sm border border-line bg-ivory px-2 py-1 text-xs normal-case tracking-normal text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/40"
              >
                {series.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DED8CC" />
              <XAxis dataKey="date" tick={axis} tickFormatter={formatTickDate} minTickGap={40} />
              <YAxis tick={axis} domain={["auto", "auto"]} width={56} />
              <Tooltip
                labelFormatter={(value: any) => `Date: ${value}`}
                formatter={(value: any, name: any) => [Number(value).toFixed(2), name === "avg20" ? "20-day avg" : "Close"]}
                contentStyle={{ background: "#F9F6EE", border: "1px solid #DED8CC", borderRadius: 2, fontFamily: "var(--font-mono)", fontSize: 12 }}
              />
              <Line type="monotone" dataKey="close" stroke="#282926" strokeWidth={1.75} dot={false} name="Close" />
              <Line type="monotone" dataKey="avg20" stroke="#B89A64" strokeWidth={1.25} dot={false} name="20-day avg" strokeDasharray="4 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
          {periodReturn != null && <span>Period change: {periodReturn.toFixed(2)}%</span>}
          <span>Range: {newLow.toFixed(2)} – {newHigh.toFixed(2)}</span>
          <span>Prices are latest available, not live.</span>
        </div>
      </CardContent>
    </Card>
  );
}
