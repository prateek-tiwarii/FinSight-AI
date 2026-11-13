"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, FolderOpen, Loader2, PlayCircle, Plus, Save, ShieldAlert, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { UploadDropzone } from "@/components/portfolio/upload-dropzone";
import { HoldingsEditor, validateHoldings, type EditableHoldingRow } from "@/components/portfolio/holdings-editor";
import {
  analyzeAgent,
  createPortfolio,
  deletePortfolio,
  extractPortfolio,
  listPortfolios,
  updatePortfolio as updatePortfolioApi,
} from "@/lib/api";
import { useAnalysisStore, makeHoldingId } from "@/hooks/use-analysis-store";
import { useAuth } from "@/providers/auth-provider";
import { formatDate } from "@/lib/formatters";
import type { ConfirmedHolding, PortfolioDetail } from "@/types/api";

function toPayloadHoldings(rows: EditableHoldingRow[]): ConfirmedHolding[] {
  return rows.map((h) => ({
    stock_symbol: h.stock_symbol.trim(),
    quantity: Number(h.quantity),
    average_purchase_price: Number(h.average_purchase_price),
    exchange: h.exchange?.trim() || undefined,
  }));
}

export default function PortfolioPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status } = useAuth();
  const {
    uploadedFileName,
    setUploadedFileName,
    extraction,
    setExtraction,
    holdings,
    setHoldings,
    setAnalysis,
    setThreadId,
    setQuestionnaireDraft,
    analysis,
    resetAll,
  } = useAnalysisStore();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [portfolioName, setPortfolioName] = useState("");
  const [confirmNew, setConfirmNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioDetail | null>(null);
  const initialized = useRef(false);

  const portfoliosQuery = useQuery({
    queryKey: ["portfolios"],
    queryFn: listPortfolios,
    enabled: status === "guest" || status === "authenticated",
  });

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      resetAll();
      setFile(null);
      setPreviewUrl(null);
      setExtractError(null);
      setConfirmed(false);
      setPortfolioId(null);
      setPortfolioName("");
      router.replace("/portfolio");
    }
  }, [resetAll, router]);

  const extractMutation = useMutation({
    mutationFn: extractPortfolio,
    onSuccess: (data) => {
      setExtraction(data);
      const rows: EditableHoldingRow[] = (data.holdings || []).map(h => ({ _id: makeHoldingId(), stock_symbol: h.stock_symbol || "", quantity: Number(h.quantity), average_purchase_price: Number(h.average_purchase_price), exchange: null }));
      setHoldings(rows);
      setConfirmed(false);
      setPortfolioId(null);
      toast.success("Holdings extracted. Please review and confirm before analysis.");
    },
    onError: (err: any) => {
      const msg = err?.message || "Failed to extract portfolio from image.";
      setExtractError(msg);
      toast.error(msg);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const invalid = validateHoldings(holdings);
      if (invalid) throw new Error(invalid);
      const name = portfolioName.trim() || "My Portfolio";
      if (portfolioId) {
        return updatePortfolioApi(portfolioId, { name, holdings: toPayloadHoldings(holdings) });
      }
      return createPortfolio({ name, holdings: toPayloadHoldings(holdings) });
    },
    onSuccess: (saved) => {
      setPortfolioId(saved.id);
      setPortfolioName(saved.name);
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      toast.success("Portfolio saved.");
    },
    onError: (err: any) => toast.error(err?.message || "Could not save portfolio."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePortfolio(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      if (portfolioId === id) {
        setPortfolioId(null);
        setPortfolioName("");
      }
      setDeleteTarget(null);
      toast.success("Portfolio deleted.");
    },
    onError: (err: any) => toast.error(err?.message || "Could not delete portfolio."),
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeAgent,
    onSuccess: (data) => {
      setAnalysis(data);
      if (data.thread_id) setThreadId(data.thread_id);
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success(data.pending_questionnaire ? "Analysis paused for questionnaire." : "Analysis completed.");
      router.push("/analysis");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to start agent analysis.");
    },
  });

  const onFileSelected = (f: File, url: string) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f); setPreviewUrl(url); setUploadedFileName(f.name); setExtractError(null); setExtraction(null); setHoldings([]); setConfirmed(false); setPortfolioId(null);
  };
  const onClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null); setPreviewUrl(null); setUploadedFileName(null); setExtraction(null); setHoldings([]); setConfirmed(false); setExtractError(null);
  };

  const resetWorkspace = () => {
    resetAll();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setExtractError(null);
    setConfirmed(false);
    setPortfolioId(null);
    setPortfolioName("");
    setConfirmNew(false);
    router.replace("/portfolio");
  };

  const selectPortfolio = (portfolio: PortfolioDetail) => {
    const rows: EditableHoldingRow[] = portfolio.holdings.map((h) => ({
      _id: makeHoldingId(),
      stock_symbol: h.stock_symbol,
      quantity: Number(h.quantity),
      average_purchase_price: Number(h.average_purchase_price),
      exchange: h.exchange ?? null,
    }));
    setHoldings(rows);
    setPortfolioId(portfolio.id);
    setPortfolioName(portfolio.name);
    setExtraction(null);
    setUploadedFileName(null);
    setFile(null);
    setPreviewUrl(null);
    setExtractError(null);
    setConfirmed(false);
    toast.success(`Loaded “${portfolio.name}”. Review holdings before analysis.`);
  };

  const canExtract = !!file && !extractMutation.isPending;

  const handleExtract = async () => {
    if (!file) return;
    setExtractError(null);
    await extractMutation.mutateAsync(file);
  };

  const handleStartAnalysis = async () => {
    const err = validateHoldings(holdings);
    if (err) { toast.error(err); return; }
    if (!confirmed) { toast.error("Please confirm the holdings before starting analysis."); return; }
    const payloadHoldings = toPayloadHoldings(holdings);
    // reset questionnaire draft/thread for a fresh run; backend returns new thread
    setQuestionnaireDraft({ additional_context: {} });
    setThreadId(null);
    setAnalysis(null);
    await analyzeMutation.mutateAsync({
      holdings: payloadHoldings,
      history_period: "1y",
      history_interval: "1d",
      max_tool_iterations: 3,
      portfolio_id: portfolioId,
      portfolio_name: portfolioId ? undefined : portfolioName.trim() || undefined,
    });
  };

  const portfolios = portfoliosQuery.data?.portfolios ?? [];

  return (
    <div className="space-y-8 max-w-6xl animate-fade-up">
      <div className="border-b border-line pb-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-gold mb-2">Portfolio</div>
        <h1 className="text-3xl md:text-5xl font-serif tracking-tight">My Portfolio</h1>
        <p className="text-muted-foreground mt-3 max-w-3xl">Upload a Groww portfolio screenshot, review extracted holdings, confirm them, and start multi-agent analysis.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Saved portfolios</CardTitle>
              <CardDescription>Reuse a stored portfolio or start a clean workspace.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              if (holdings.length > 0 || analysis?.thread_id) setConfirmNew(true);
              else resetWorkspace();
            }}>
              <Plus className="h-4 w-4" /> New portfolio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {portfoliosQuery.isLoading ? (
            <div className="text-sm text-muted-foreground inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading saved portfolios…</div>
          ) : portfoliosQuery.isError ? (
            <Alert variant="error" title="Could not load portfolios">{(portfoliosQuery.error as any)?.message || "Try refreshing the page."}</Alert>
          ) : portfolios.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved portfolios yet. Add holdings below, then save or run an analysis.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className={`border p-4 bg-cream/30 space-y-2 ${portfolioId === portfolio.id ? "border-gold/60" : "border-line"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{portfolio.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        {portfolio.holdings.length} holding{portfolio.holdings.length === 1 ? "" : "s"} · Updated {formatDate(portfolio.updated_at)}
                      </div>
                    </div>
                    {portfolioId === portfolio.id && <Badge variant="success">Selected</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => selectPortfolio(portfolio)}>
                      <FolderOpen className="h-4 w-4" /> Use
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-2 text-destructive" onClick={() => setDeleteTarget(portfolio)}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                    {portfolio.latest_report_id && (
                      <Button size="sm" variant="ghost" onClick={() => router.push(`/report/view?reportId=${portfolio.latest_report_id}`)}>
                        Latest report
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>1. Upload portfolio screenshot</CardTitle>
          <CardDescription>Supported: PNG, JPG, JPEG, WEBP (max 10 MB). Extraction results must be reviewed before analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadDropzone file={file} previewUrl={previewUrl} onFileSelected={onFileSelected} onClear={onClear} uploading={extractMutation.isPending} error={extractError} />
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExtract} disabled={!canExtract} className="gap-2">
              {extractMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <PlayCircle className="h-4 w-4"/>}
              {extraction ? "Re-extract holdings" : "Extract holdings"}
            </Button>
            {uploadedFileName && <span className="text-sm text-muted-foreground self-center">Current file: {uploadedFileName}</span>}
          </div>
          {!extraction && !extractMutation.isPending && <Alert variant="info" title="Next step">Upload a screenshot and extract holdings. You can also add holdings manually below.</Alert>}
        </CardContent>
      </Card>

      <HoldingsEditor holdings={holdings} setHoldings={setHoldings} warnings={extraction?.warnings || []} extractionNotes={extraction?.extraction_notes || null} />

      <Card>
        <CardHeader>
          <CardTitle>2. Save this portfolio</CardTitle>
          <CardDescription>Saved portfolios keep their holdings and can be reused for future analyses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label htmlFor="portfolio-name" className="text-sm font-medium">Portfolio name</label>
              <input
                id="portfolio-name"
                value={portfolioName}
                onChange={(event) => setPortfolioName(event.target.value)}
                placeholder="e.g. Long-term holdings"
                maxLength={200}
                className="flex h-10 w-full rounded-sm border border-line bg-ivory px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/50 focus-visible:border-gold/40"
              />
            </div>
            <Button variant="outline" className="gap-2" disabled={saveMutation.isPending || holdings.length === 0} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {portfolioId ? "Update saved portfolio" : "Save portfolio"}
            </Button>
          </div>
          {portfolioId && <p className="text-xs text-muted-foreground font-mono">Editing saved portfolio · {portfolioId.slice(0, 8)}…</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Confirm and analyze</CardTitle>
          <CardDescription>Confirm that holdings are correct. Uncertain extractions are never accepted silently.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start gap-3 text-sm cursor-pointer">
            <input type="checkbox" className="mt-1 accent-blue-600" checked={confirmed} onChange={(e)=>setConfirmed(e.target.checked)} />
            <span>I have reviewed the holdings (symbols, quantities, average purchase prices) and confirm they are correct to the best of my knowledge.</span>
          </label>
          {!confirmed && holdings.length > 0 && <Alert variant="warning" title="Confirmation required"><div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4"/>Please confirm holdings before starting multi-agent analysis.</div></Alert>}
          <div className="flex flex-wrap gap-3 items-center">
            <Button size="lg" onClick={handleStartAnalysis} disabled={analyzeMutation.isPending || holdings.length===0} className="gap-2">
              {analyzeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <ArrowRight className="h-4 w-4"/>}
              Start multi-agent analysis
            </Button>
            {analysis?.thread_id && <span className="text-xs text-muted-foreground font-mono">Last analysis thread: {analysis.thread_id}</span>}
          </div>
          {analyzeMutation.isError && <Alert variant="error" title="Analysis could not be started">{(analyzeMutation.error as any)?.message || "An unexpected error occurred."}</Alert>}
        </CardContent>
      </Card>

      {confirmNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="new-workspace-title" className="w-full max-w-md border border-line bg-ivory p-5 space-y-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold">New portfolio</div>
              <h2 id="new-workspace-title" className="font-serif text-2xl mt-1">Clear the current workspace?</h2>
            </div>
            <p className="text-sm text-muted-foreground">This clears the unsaved holdings, current analysis, and questionnaire draft from this browser session. Saved portfolios and reports are not deleted.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmNew(false)}>Cancel</Button>
              <Button onClick={resetWorkspace}>Start new workspace</Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-portfolio-title" className="w-full max-w-md border border-line bg-ivory p-5 space-y-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-destructive">Delete portfolio</div>
              <h2 id="delete-portfolio-title" className="font-serif text-2xl mt-1">Delete “{deleteTarget.name}”?</h2>
            </div>
            <p className="text-sm text-muted-foreground">This permanently deletes the saved portfolio and its holdings. Existing analysis reports remain available in Reports.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending} className="gap-2">
                {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete portfolio
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
