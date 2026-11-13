"use client";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Send, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getQuestionnaire, resumeAgent } from "@/lib/api";
import type { AgentAnalyzeResponse, BehavioralQuestionnaireResponse, BehavioralQuestionnaireSchema } from "@/types/api";
import { useAnalysisStore } from "@/hooks/use-analysis-store";

type Props = {
  analysis: AgentAnalyzeResponse;
  onResumed: (data: AgentAnalyzeResponse) => void;
};

const FIELD_KEYS = [
  "investment_horizon",
  "risk_tolerance",
  "primary_investment_objective",
  "reaction_to_15_20pct_decline",
  "investment_experience",
] as const;

export function QuestionnairePanel({ analysis, onResumed }: Props) {
  const { threadId, setThreadId, questionnaireDraft, setQuestionnaireDraft } = useAnalysisStore();
  const schemaFromAnalysis = analysis.questionnaire_schema || null;
  const { data: fetchedSchema, isLoading, error, refetch } = useQuery({
    queryKey: ["questionnaire"],
    queryFn: getQuestionnaire,
    enabled: !schemaFromAnalysis,
    staleTime: 5 * 60 * 1000,
  });
  const schema: BehavioralQuestionnaireSchema | null = schemaFromAnalysis || fetchedSchema || null;

  const [form, setForm] = useState<any>(() => ({
    investment_horizon: questionnaireDraft?.investment_horizon || "",
    risk_tolerance: questionnaireDraft?.risk_tolerance || "",
    primary_investment_objective: questionnaireDraft?.primary_investment_objective || "",
    reaction_to_15_20pct_decline: questionnaireDraft?.reaction_to_15_20pct_decline || "",
    investment_experience: questionnaireDraft?.investment_experience || "",
    additional_context: {
      financial_goals: questionnaireDraft?.additional_context?.financial_goals || "",
      liquidity_requirements: questionnaireDraft?.additional_context?.liquidity_requirements || "",
      existing_investment_constraints: questionnaireDraft?.additional_context?.existing_investment_constraints || "",
    },
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setQuestionnaireDraft(form); }, [form, setQuestionnaireDraft]);
  useEffect(() => { if (analysis.thread_id) setThreadId(analysis.thread_id); }, [analysis.thread_id, setThreadId]);

  const resumeMutation = useMutation({
    mutationFn: resumeAgent,
    onSuccess: (data) => {
      if (data.thread_id) setThreadId(data.thread_id);
      onResumed(data);
      toast.success(data.final_report ? "Analysis resumed and final report generated." : "Analysis resumed.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to resume analysis. Your responses are preserved.");
    },
  });

  const validate = () => {
    const e: Record<string, string> = {};
    for (const k of FIELD_KEYS) {
      if (!form[k]) e[k] = "This field is required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error("Please complete all required questionnaire fields."); return; }
    const tid = analysis.thread_id || threadId;
    if (!tid) { toast.error("Missing thread ID. Cannot resume analysis."); return; }
    const payload: BehavioralQuestionnaireResponse = {
      investment_horizon: form.investment_horizon,
      risk_tolerance: form.risk_tolerance,
      primary_investment_objective: form.primary_investment_objective,
      reaction_to_15_20pct_decline: form.reaction_to_15_20pct_decline,
      investment_experience: form.investment_experience,
      additional_context: {
        ...(form.additional_context?.financial_goals ? { financial_goals: form.additional_context.financial_goals } : {}),
        ...(form.additional_context?.liquidity_requirements ? { liquidity_requirements: form.additional_context.liquidity_requirements } : {}),
        ...(form.additional_context?.existing_investment_constraints ? { existing_investment_constraints: form.additional_context.existing_investment_constraints } : {}),
      },
    };
    await resumeMutation.mutateAsync({ thread_id: tid, questionnaire_responses: payload });
  };

  if (isLoading && !schema) return <Card><CardContent className="p-6 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Loading questionnaire...</CardContent></Card>;
  if ((error || !schema) && !schemaFromAnalysis) return (
    <Card><CardContent className="p-6 space-y-3">
      <Alert variant="error" title="Could not load questionnaire">The questionnaire schema could not be retrieved from the backend.</Alert>
      <Button variant="outline" onClick={() => refetch()} className="gap-2"><RotateCcw className="h-4 w-4"/>Retry</Button>
    </CardContent></Card>
  );

  const requiredQuestions = (schema?.questions || []).filter(q => FIELD_KEYS.includes(q.key as any));

  return (
    <Card className="border-amber-500/30">
      <CardHeader>
        <CardTitle>{schema?.title || "Behavioral Questionnaire"}</CardTitle>
        <CardDescription>{schema?.description || "Complete your preferences to continue analysis."}</CardDescription>
      </CardHeader>
      <CardContent>
        {schema?.notes?.length ? <Alert variant="info" className="mb-4"><ul className="list-disc pl-5 space-y-1">{schema.notes.map((n,i)=><li key={i}>{n}</li>)}</ul></Alert> : null}
        <form onSubmit={onSubmit} className="space-y-6">
          {requiredQuestions.map((q) => (
            <div key={q.key} className="space-y-2">
              <Label className="text-sm font-medium">{q.question} <span className="text-[#9a5a4a]">*</span></Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt) => (
                  <label key={opt.value} className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer transition-colors ${form[q.key] === opt.value ? "border-gold/40 bg-gold/10" : "border-line hover:bg-cream/70"}`}>
                    <input type="radio" name={q.key} value={opt.value} checked={form[q.key] === opt.value} onChange={(e)=>setForm((f:any)=>({ ...f, [q.key]: e.target.value }))} className="accent-[#B89A64]" />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors[q.key] && <p className="text-xs text-[#9a5a4a]">{errors[q.key]}</p>}
            </div>
          ))}

          <div className="space-y-3 pt-2 border-t border-line">
            <div className="text-sm font-medium">Optional additional context</div>
            <div className="grid gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Financial goals</Label>
                <Textarea value={form.additional_context?.financial_goals || ""} onChange={(e)=>setForm((f:any)=>({ ...f, additional_context: { ...(f.additional_context||{}), financial_goals: e.target.value } }))} placeholder="e.g. Retirement in 15 years, child education..." />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Liquidity requirements</Label>
                <Textarea value={form.additional_context?.liquidity_requirements || ""} onChange={(e)=>setForm((f:any)=>({ ...f, additional_context: { ...(f.additional_context||{}), liquidity_requirements: e.target.value } }))} placeholder="e.g. Need access to part of funds within 1 year..." />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Existing investment constraints</Label>
                <Textarea value={form.additional_context?.existing_investment_constraints || ""} onChange={(e)=>setForm((f:any)=>({ ...f, additional_context: { ...(f.additional_context||{}), existing_investment_constraints: e.target.value } }))} placeholder="e.g. Avoid certain sectors, tax considerations..." />
              </div>
            </div>
          </div>

          {resumeMutation.isError && <Alert variant="error" title="Resume failed">{(resumeMutation.error as any)?.message || "Could not resume analysis."} Your responses are preserved and you can retry.</Alert>}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={resumeMutation.isPending} className="gap-2">
              {resumeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
              Submit questionnaire &amp; resume analysis
            </Button>
            {analysis.thread_id && <span className="text-xs text-muted-foreground">Thread: {analysis.thread_id}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
