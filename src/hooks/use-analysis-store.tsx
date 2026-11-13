"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AgentAnalyzeResponse, BehavioralQuestionnaireResponse, ConfirmedHolding, PortfolioExtractionResponse } from "@/types/api";

type EditableHolding = ConfirmedHolding & { _id: string; exchange?: string | null };

type Store = {
  uploadedFileName: string | null;
  setUploadedFileName: (v: string | null) => void;
  extraction: PortfolioExtractionResponse | null;
  setExtraction: (v: PortfolioExtractionResponse | null) => void;
  holdings: EditableHolding[];
  setHoldings: (v: EditableHolding[]) => void;
  analysis: AgentAnalyzeResponse | null;
  setAnalysis: (v: AgentAnalyzeResponse | null) => void;
  threadId: string | null;
  setThreadId: (v: string | null) => void;
  questionnaireDraft: Partial<BehavioralQuestionnaireResponse> & { additional_context?: any };
  setQuestionnaireDraft: (v: any) => void;
  resetAll: () => void;
};

const Ctx = createContext<Store | null>(null);

const STORAGE_KEY = "finsight_ai_m6_state_v1";

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<PortfolioExtractionResponse | null>(null);
  const [holdings, setHoldings] = useState<EditableHolding[]>([]);
  const [analysis, setAnalysis] = useState<AgentAnalyzeResponse | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [questionnaireDraft, setQuestionnaireDraft] = useState<any>({ additional_context: {} });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUploadedFileName(parsed.uploadedFileName ?? null);
        setExtraction(parsed.extraction ?? null);
        setHoldings(parsed.holdings ?? []);
        setAnalysis(parsed.analysis ?? null);
        setThreadId(parsed.threadId ?? null);
        setQuestionnaireDraft(parsed.questionnaireDraft ?? { additional_context: {} });
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ uploadedFileName, extraction, holdings, analysis, threadId, questionnaireDraft }));
    } catch {}
  }, [uploadedFileName, extraction, holdings, analysis, threadId, questionnaireDraft, hydrated]);

  const resetAll = () => {
    setUploadedFileName(null); setExtraction(null); setHoldings([]); setAnalysis(null); setThreadId(null); setQuestionnaireDraft({ additional_context: {} });
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const value = useMemo(() => ({ uploadedFileName, setUploadedFileName, extraction, setExtraction, holdings, setHoldings, analysis, setAnalysis, threadId, setThreadId, questionnaireDraft, setQuestionnaireDraft, resetAll }), [uploadedFileName, extraction, holdings, analysis, threadId, questionnaireDraft]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAnalysisStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAnalysisStore must be used within AnalysisProvider");
  return ctx;
}

export function makeHoldingId() {
  return Math.random().toString(36).slice(2, 10);
}
