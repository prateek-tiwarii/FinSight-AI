export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
export const MAX_UPLOAD_SIZE_MB = 10;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Unsupported file type. Please upload PNG, JPG, JPEG, or WEBP.";
  }
  if (file.size <= 0) return "Selected file is empty.";
  if (file.size > MAX_UPLOAD_SIZE_BYTES) return `File too large. Max size is ${MAX_UPLOAD_SIZE_MB} MB.`;
  return null;
}

export type WorkflowStage = {
  key: string;
  label: string;
  status: "pending" | "running" | "completed" | "partial" | "failed" | "awaiting";
};

export function deriveWorkflowStages(state: {
  analysis_status?: string | null;
  workflow_stage?: string | null;
  pending_questionnaire?: boolean | null;
  human_review_status?: string | null;
  portfolio_metrics?: any;
  analyst_findings?: any;
  research_status?: string | null;
  research_findings?: any;
  critic_status?: string | null;
  critic_findings?: any;
  behavioral_status?: string | null;
  behavioral_findings?: any;
  final_advisor_status?: string | null;
  final_report?: any;
}): WorkflowStage[] {
  const ws = state.workflow_stage || "";
  const as = state.analysis_status || "";
  const awaiting = !!state.pending_questionnaire || as === "awaiting_user_input" || ws === "awaiting_user_input" || state.human_review_status === "pending";
  const finalDone = !!state.final_report || state.final_advisor_status === "completed";

  const mapStatus = (done: boolean, partial: boolean, failed: boolean, runningCond: boolean): WorkflowStage["status"] => {
    if (done) return "completed";
    if (failed) return "failed";
    if (partial) return "partial";
    if (runningCond) return "running";
    return "pending";
  };

  const portfolioDone = !!state.portfolio_metrics;
  const analystDone = !!state.analyst_findings;
  const researchDone = !!state.research_findings || ["completed", "no_results"].includes(state.research_status || "");
  const researchPartial = state.research_status === "partial" || state.research_status === "failed";
  const criticDone = !!state.critic_findings || state.critic_status === "completed";
  const behavioralDone = !!state.behavioral_findings || state.behavioral_status === "completed";
  const finalFailed = state.final_advisor_status === "failed";
  const finalPartial = state.final_advisor_status === "partial" || finalFailed;
  const finalCompleted = finalDone && !finalPartial;

  const inProgress = as === "pending" || as === "analyzing" || as === "portfolio_ready";

  const stages: WorkflowStage[] = [
    { key: "portfolio", label: "Portfolio Analysis", status: mapStatus(portfolioDone, false, false, inProgress && !portfolioDone) },
    { key: "analyst", label: "Market Analyst", status: mapStatus(analystDone, as === "partial" && portfolioDone && !analystDone, as === "failed" && !analystDone, portfolioDone && !analystDone && !awaiting && !finalDone) },
    { key: "research", label: "Research Agent", status: mapStatus(researchDone && state.research_status !== "failed", state.research_status === "partial", state.research_status === "failed" && !researchDone, analystDone && !researchDone && !awaiting && !finalDone) },
    { key: "critic", label: "Risk Critic", status: mapStatus(criticDone, state.critic_status === "partial", state.critic_status === "failed", (researchDone || researchPartial) && !criticDone && !awaiting && !finalDone) },
    { key: "questionnaire", label: "Behavioral Questionnaire", status: awaiting ? "awaiting" : behavioralDone ? "completed" : criticDone ? "pending" : "pending" },
    { key: "behavioral", label: "Behavioral Advisor", status: mapStatus(behavioralDone, state.behavioral_status === "partial", state.behavioral_status === "failed", !awaiting && criticDone && !behavioralDone && !finalDone && state.human_review_status === "completed") },
    { key: "final", label: "Final Advisor", status: mapStatus(finalCompleted, finalPartial, finalFailed, behavioralDone && !finalDone) },
  ];
  return stages;
}
