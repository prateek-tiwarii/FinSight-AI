import type {
  AgentAnalyzeRequest,
  AgentAnalyzeResponse,
  AgentResumeRequest,
  AnalysisDetail,
  AnalysisListResponse,
  AuthActionResponse,
  AuthMeResponse,
  BehavioralQuestionnaireSchema,
  ConfirmedHolding,
  GuestConvertResponse,
  PortfolioAnalyzeRequest,
  PortfolioAnalyzeResponse,
  PortfolioDetail,
  PortfolioExtractionResponse,
  PortfolioListResponse,
  ReportDetail,
  ReportListResponse,
} from "@/types/api";

export class ApiError extends Error {
  status: number;
  detail?: unknown;
  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const COOKIE_PREFIX = process.env.NEXT_PUBLIC_COOKIE_PREFIX || "finsight";
const CSRF_COOKIE = `${COOKIE_PREFIX}_csrf`;
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);
let csrfInitialization: Promise<string> | null = null;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) return decodeURIComponent(trimmed.slice(prefix.length));
  }
  return null;
}

export function getCsrfToken(): string | null {
  return readCookie(CSRF_COOKIE);
}

export async function initializeCsrfToken(): Promise<string> {
  const existing = getCsrfToken();
  if (existing) return existing;
  if (!csrfInitialization) {
    // The backend issues the readable CSRF cookie on the first API GET.
    csrfInitialization = (async () => {
      await fetch(`${BASE_URL}/api/auth/me`, { credentials: "include", cache: "no-store" });
      const token = getCsrfToken();
      if (!token) throw new Error("CSRF initialization failed: token cookie was not set");
      return token;
    })().finally(() => {
      csrfInitialization = null;
    });
  }
  return csrfInitialization;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    if (body && typeof body === "object" && "detail" in (body as any)) {
      const d = (body as any).detail;
      if (typeof d === "string") message = d;
      else if (Array.isArray(d)) message = d.map((x) => x?.msg || JSON.stringify(x)).join("; ");
      else if (d && typeof d === "object" && typeof d.message === "string") message = d.message;
      else message = JSON.stringify(d);
    } else if (typeof body === "string" && body) {
      message = body;
    }
    throw new ApiError(message, res.status, body);
  }
  return body as T;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (!SAFE_METHODS.has(method)) {
    const token = await initializeCsrfToken();
    headers.set("X-CSRF-Token", token);
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    method,
    headers,
    credentials: "include",
    cache: init.cache ?? "no-store",
  });
  return handleResponse<T>(res);
}

function jsonBody(value: unknown): string {
  return JSON.stringify(value);
}

// ---------------------------------------------------------------------------
// Auth / guest
// ---------------------------------------------------------------------------

export function getAuthMe(): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>("/api/auth/me");
}

export function registerAccount(payload: {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}): Promise<AuthActionResponse> {
  return apiFetch<AuthActionResponse>("/api/auth/register", {
    method: "POST",
    body: jsonBody(payload),
  });
}

export function loginAccount(payload: {
  email: string;
  password: string;
}): Promise<AuthActionResponse> {
  return apiFetch<AuthActionResponse>("/api/auth/login", {
    method: "POST",
    body: jsonBody(payload),
  });
}

export function logoutAccount(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/logout", { method: "POST" });
}

export function continueAsGuest(): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>("/api/guest/session", { method: "POST" });
}

export function getGuestMe(): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>("/api/guest/me");
}

export function convertGuestSession(confirmMerge: boolean): Promise<GuestConvertResponse> {
  return apiFetch<GuestConvertResponse>("/api/guest/convert", {
    method: "POST",
    body: jsonBody({ confirm_merge: confirmMerge }),
  });
}

// ---------------------------------------------------------------------------
// Portfolio / analysis / reports
// ---------------------------------------------------------------------------

export async function getHealth(): Promise<{ status: string }> {
  const res = await fetch(`${BASE_URL}/api/health`, { cache: "no-store" });
  return handleResponse(res);
}

export async function extractPortfolio(file: File): Promise<PortfolioExtractionResponse> {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<PortfolioExtractionResponse>("/api/extract/portfolio", {
    method: "POST",
    body: form,
  });
}

export async function analyzePortfolio(payload: PortfolioAnalyzeRequest): Promise<PortfolioAnalyzeResponse> {
  return apiFetch<PortfolioAnalyzeResponse>("/api/portfolio/analyze", {
    method: "POST",
    body: jsonBody(payload),
  });
}

export async function analyzeAgent(payload: AgentAnalyzeRequest): Promise<AgentAnalyzeResponse> {
  return apiFetch<AgentAnalyzeResponse>("/api/agent/analyze", {
    method: "POST",
    body: jsonBody(payload),
  });
}

export async function getQuestionnaire(): Promise<BehavioralQuestionnaireSchema> {
  return apiFetch<BehavioralQuestionnaireSchema>("/api/agent/questionnaire");
}

export async function resumeAgent(payload: AgentResumeRequest): Promise<AgentAnalyzeResponse> {
  return apiFetch<AgentAnalyzeResponse>("/api/agent/resume", {
    method: "POST",
    body: jsonBody(payload),
  });
}

export function listPortfolios(): Promise<PortfolioListResponse> {
  return apiFetch<PortfolioListResponse>("/api/portfolios");
}

export function getPortfolio(id: string): Promise<PortfolioDetail> {
  return apiFetch<PortfolioDetail>(`/api/portfolios/${id}`);
}

export function createPortfolio(payload: {
  name: string;
  holdings: ConfirmedHolding[];
}): Promise<PortfolioDetail> {
  return apiFetch<PortfolioDetail>("/api/portfolios", {
    method: "POST",
    body: jsonBody(payload),
  });
}

export function updatePortfolio(
  id: string,
  payload: { name?: string; holdings?: ConfirmedHolding[] },
): Promise<PortfolioDetail> {
  return apiFetch<PortfolioDetail>(`/api/portfolios/${id}`, {
    method: "PATCH",
    body: jsonBody(payload),
  });
}

export function deletePortfolio(id: string): Promise<void> {
  return apiFetch<void>(`/api/portfolios/${id}`, { method: "DELETE" });
}

export function listAnalyses(): Promise<AnalysisListResponse> {
  return apiFetch<AnalysisListResponse>("/api/analyses");
}

export function getAnalysis(id: string): Promise<AnalysisDetail> {
  return apiFetch<AnalysisDetail>(`/api/analyses/${id}`);
}

export function listReports(): Promise<ReportListResponse> {
  return apiFetch<ReportListResponse>("/api/reports");
}

export function getReport(id: string): Promise<ReportDetail> {
  return apiFetch<ReportDetail>(`/api/reports/${id}`);
}

export { BASE_URL as API_BASE_URL, CSRF_COOKIE };
