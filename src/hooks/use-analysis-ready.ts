"use client";
import { useAnalysisStore } from "@/hooks/use-analysis-store";

export function useAnalysisReady() {
  const { holdings, analysis } = useAnalysisStore();
  return { hasHoldings: holdings.length > 0, hasAnalysis: !!analysis, analysis };
}
