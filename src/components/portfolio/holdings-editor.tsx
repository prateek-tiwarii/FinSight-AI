"use client";
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import type { ConfirmedHolding } from "@/types/api";
import { makeHoldingId } from "@/hooks/use-analysis-store";

export type EditableHoldingRow = ConfirmedHolding & { _id: string };

type Props = {
  holdings: EditableHoldingRow[];
  setHoldings: (h: EditableHoldingRow[]) => void;
  warnings?: string[];
  extractionNotes?: string | null;
};

export function HoldingsEditor({ holdings, setHoldings, warnings = [], extractionNotes }: Props) {
  const update = (id: string, patch: Partial<EditableHoldingRow>) => {
    setHoldings(holdings.map(h => h._id === id ? { ...h, ...patch } : h));
  };
  const remove = (id: string) => setHoldings(holdings.filter(h => h._id !== id));
  const add = () => setHoldings([...holdings, { _id: makeHoldingId(), stock_symbol: "", quantity: 1, average_purchase_price: 0, exchange: "" }]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Review &amp; confirm holdings</CardTitle>
          <CardDescription>Edit extracted values, add missing holdings, or remove incorrect rows. All fields must be valid before analysis.</CardDescription>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={add} className="gap-2"><Plus className="h-4 w-4"/>Add holding</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {warnings.length > 0 && (
          <Alert variant="warning" title="Extraction warnings">
            <ul className="list-disc pl-5 space-y-1">{warnings.map((w,i)=><li key={i}>{w}</li>)}</ul>
          </Alert>
        )}
        {extractionNotes && <Alert variant="info" title="Extraction notes">{extractionNotes}</Alert>}
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full text-sm">
            <thead className="bg-cream/70 text-muted-foreground">
              <tr>
                <th className="text-left p-3 font-medium">Stock symbol</th>
                <th className="text-left p-3 font-medium">Exchange</th>
                <th className="text-left p-3 font-medium">Quantity</th>
                <th className="text-left p-3 font-medium">Avg. purchase price</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {holdings.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No holdings yet. Add holdings manually or extract from a screenshot.</td></tr>
              )}
              {holdings.map((h) => {
                const symErr = !h.stock_symbol?.trim();
                const qtyErr = !(Number(h.quantity) > 0);
                const priceErr = !(Number(h.average_purchase_price) > 0);
                return (
                  <tr key={h._id} className="border-t border-line/60 align-top">
                    <td className="p-2">
                      <Input value={h.stock_symbol} onChange={(e)=>update(h._id,{stock_symbol: e.target.value.toUpperCase()})} placeholder="e.g. RELIANCE" className={symErr?"border-red-400/60":""} />
                      {symErr && <div className="text-xs text-[#9a5a4a] mt-1">Required</div>}
                    </td>
                    <td className="p-2">
                      <Input value={h.exchange || ""} onChange={(e)=>update(h._id,{exchange: e.target.value.toUpperCase()})} placeholder="NSE/BSE (optional)" />
                    </td>
                    <td className="p-2">
                      <Input type="number" min="0" step="any" value={Number.isFinite(h.quantity)?h.quantity:""} onChange={(e)=>update(h._id,{quantity: parseFloat(e.target.value)})} className={qtyErr?"border-red-400/60":""} />
                      {qtyErr && <div className="text-xs text-[#9a5a4a] mt-1">Must be &gt; 0</div>}
                    </td>
                    <td className="p-2">
                      <Input type="number" min="0" step="any" value={Number.isFinite(h.average_purchase_price)?h.average_purchase_price:""} onChange={(e)=>update(h._id,{average_purchase_price: parseFloat(e.target.value)})} className={priceErr?"border-red-400/60":""} />
                      {priceErr && <div className="text-xs text-[#9a5a4a] mt-1">Must be &gt; 0</div>}
                    </td>
                    <td className="p-2 text-right">
                      <Button type="button" variant="ghost" size="icon" onClick={()=>remove(h._id)} aria-label="Remove holding"><Trash2 className="h-4 w-4 text-muted-foreground hover:text-[#9a5a4a]" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">Exchange is optional. Uncertain or unresolved symbols may fail during market data lookup and will be reported in analysis results.</p>
      </CardContent>
    </Card>
  );
}

export function validateHoldings(holdings: EditableHoldingRow[]): string | null {
  if (!holdings.length) return "Add at least one holding before starting analysis.";
  for (const h of holdings) {
    if (!h.stock_symbol || !h.stock_symbol.trim()) return "Each holding must have a non-empty stock symbol.";
    if (!(Number(h.quantity) > 0)) return `Quantity for ${h.stock_symbol || "a holding"} must be greater than 0.`;
    if (!(Number(h.average_purchase_price) > 0)) return `Average purchase price for ${h.stock_symbol || "a holding"} must be greater than 0.`;
  }
  return null;
}
