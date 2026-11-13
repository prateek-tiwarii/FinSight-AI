export type ExtractionHolding = {
  stock_symbol: string;
  quantity: number;
  average_purchase_price: number;
};

export type PortfolioExtractionResponse = {
  holdings: ExtractionHolding[];
  requires_confirmation: boolean;
  source: string;
  warnings: string[];
  extraction_notes: string | null;
};

export type MarketPrice = {
  symbol: string;
  resolved_symbol: string | null;
  latest_price: number | null;
  currency: string | null;
  market_timestamp: string | null;
  source: string;
  status: string;
  message: string | null;
};

export type OHLCVPoint = {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
};

export type HistoricalData = {
  symbol: string;
  resolved_symbol: string | null;
  period: string;
  interval: string;
  points: OHLCVPoint[];
  source: string;
  status: string;
  message: string | null;
};

export type CompanyInfo = {
  symbol: string;
  resolved_symbol: string | null;
  company_name: string | null;
  sector: string | null;
  industry: string | null;
  market_cap: number | null;
  pe_ratio: number | null;
  dividend_yield: number | null;
  source: string;
  status: string;
  message: string | null;
  missing_fields: string[];
};

export type HoldingAnalysis = {
  input_symbol: string;
  resolved_symbol: string | null;
  quantity: number;
  average_purchase_price: number;
  invested_value: number | null;
  latest_price: number | null;
  current_value: number | null;
  absolute_pnl: number | null;
  percentage_return: number | null;
  allocation_percent: number | null;
  sector: string | null;
  status: string;
  message: string | null;
  company: CompanyInfo | null;
  historical_data: HistoricalData | null;
};

export type RiskMetrics = {
  portfolio_volatility_annualized: number | null;
  portfolio_volatility_note: string | null;
  max_drawdown: number | null;
  max_drawdown_note: string | null;
  concentration_top_holding_percent: number | null;
  concentration_hhi: number | null;
  concentration_note: string | null;
  assumptions: string[];
};

export type PortfolioSummary = {
  total_invested_amount: number;
  total_current_value: number | null;
  total_absolute_pnl: number | null;
  overall_percentage_return: number | null;
  analyzed_holdings_count: number;
  unresolved_or_failed_holdings_count: number;
  sector_allocation: Record<string, number>;
  total_holdings_count?: number;
  priced_holdings_count?: number;
  missing_price_holdings_count?: number;
  unresolved_holdings_count?: number;
  failed_holdings_count?: number;
  analyzed_invested_amount?: number | null;
  unvalued_invested_amount?: number | null;
  is_partial?: boolean;
  valuation_note?: string | null;
};

export type PortfolioAnalyzeResponse = {
  holdings: HoldingAnalysis[];
  summary: PortfolioSummary;
  risk: RiskMetrics;
  data_source: string;
  generated_at: string;
  warnings: string[];
  limitations: string[];
};

export type ConfirmedHolding = {
  stock_symbol: string;
  quantity: number;
  average_purchase_price: number;
  exchange?: string | null;
};

export type PortfolioAnalyzeRequest = {
  holdings: ConfirmedHolding[];
  history_period?: string;
  history_interval?: string;
};

export type AgentAnalyzeRequest = {
  holdings: ConfirmedHolding[];
  history_period?: string;
  history_interval?: string;
  user_id?: string | null;
  max_tool_iterations?: number;
  questionnaire_responses?: BehavioralQuestionnaireResponse;
  portfolio_id?: string | null;
  portfolio_name?: string | null;
};

export type MarketAnalystFindings = {
  portfolio_overview: string;
  key_findings: string[];
  stock_level_insights: Record<string, any>[];
  sector_observations: string[];
  risk_observations: string[];
  supporting_data: Record<string, any>[];
  sources: Record<string, any>[];
  warnings: string[];
};

export type ResearchDevelopment = {
  related_company?: string | null;
  headline?: string | null;
  summary?: string | null;
  sentiment?: string | null;
  publication_date?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  why_it_may_matter?: string | null;
  evidence_or_limitation_notes?: string | null;
};

export type CompanyResearch = {
  symbol?: string | null;
  company_name?: string | null;
  developments: ResearchDevelopment[];
  notes?: string | null;
};

export type ResearchFindings = {
  research_overview: string;
  company_research: CompanyResearch[];
  important_developments: ResearchDevelopment[];
  positive_signals: string[];
  negative_signals: string[];
  neutral_observations: string[];
  potential_concerns: string[];
  sources: Record<string, any>[];
  warnings: string[];
};

export type CriticChallengedClaim = { claim: string; challenged_by?: string | null; reasoning?: string | null; evidence?: Record<string, any>[] };
export type CriticIdentifiedRisk = { title: string; description: string; severity: "low"|"medium"|"high"|"critical"; evidence?: Record<string, any>[]; related_stock_or_sector?: string | null; reasoning_summary?: string | null };
export type RiskCriticFindings = {
  critic_overview: string;
  challenged_claims: CriticChallengedClaim[];
  identified_risks: CriticIdentifiedRisk[];
  contradictions: Record<string, any>[];
  missing_evidence: string[];
  severity_classification: Record<string, any>;
  recommendations_for_report: string[];
  supporting_sources: Record<string, any>[];
  warnings: string[];
};

export type QuestionnaireOption = { value: string; label: string };
export type QuestionnaireQuestion = { key: string; question: string; type: string; required: boolean; options: QuestionnaireOption[] };
export type BehavioralQuestionnaireSchema = { title: string; description: string; questions: QuestionnaireQuestion[]; notes: string[] };

export type BehavioralQuestionnaireResponse = {
  investment_horizon: "less_than_1_year" | "1_3_years" | "3_5_years" | "more_than_5_years";
  risk_tolerance: "conservative" | "moderate" | "aggressive";
  primary_investment_objective: "capital_preservation" | "long_term_wealth_creation" | "regular_income" | "capital_appreciation";
  reaction_to_15_20pct_decline: "sell_most" | "sell_some" | "hold" | "invest_more_if_fundamentals_strong";
  investment_experience: "beginner" | "intermediate" | "experienced";
  additional_context?: {
    financial_goals?: string;
    liquidity_requirements?: string;
    existing_investment_constraints?: string;
    [k: string]: any;
  };
};

export type BehavioralProfile = {
  stated_preferences: BehavioralQuestionnaireResponse;
  portfolio_risk_profile: Record<string, any>;
  mismatch_indicators: Record<string, any>[];
  behavioral_observations: string[];
  educational_notes: string[];
  warnings: string[];
};

export type BehavioralFindings = {
  behavioral_overview: string;
  profile: BehavioralProfile;
  comparisons_to_portfolio: Record<string, any>[];
  potential_behavioral_risks: Record<string, any>[];
  areas_of_conflict: Record<string, any>[];
  recommendations_educational: string[];
  warnings: string[];
};

export type FinalPortfolioReport = {
  report_title: string;
  executive_summary: string;
  overall_assessment: string;
  portfolio_strengths: string[];
  portfolio_weaknesses: string[];
  performance_insights: Record<string, any>[];
  risk_assessment: Record<string, any>;
  research_summary: Record<string, any>;
  behavioral_assessment: Record<string, any>;
  preference_mismatches: Record<string, any>[];
  key_observations: string[];
  areas_requiring_attention: string[];
  critic_findings_summary: Record<string, any>;
  supporting_sources: Record<string, any>[];
  warnings: string[];
  generated_at: string;
};

export type AgentAnalyzeResponse = {
  analysis_id?: string | null;
  portfolio_id?: string | null;
  report_id?: string | null;
  portfolio_metrics: PortfolioAnalyzeResponse | null;
  analyst_findings: MarketAnalystFindings | null;
  research_findings: ResearchFindings | null;
  research_sources: Record<string, any>[];
  research_status: string | null;
  research_warnings: string[];
  tool_execution_summaries: Record<string, any>[];
  sources: Record<string, any>[];
  warnings: string[];
  analysis_status: string;
  final_analysis: Record<string, any> | null;
  thread_id?: string | null;
  workflow_stage?: string | null;
  human_review_status?: string | null;
  pending_questionnaire?: boolean | null;
  questionnaire_schema?: BehavioralQuestionnaireSchema | null;
  critic_findings?: RiskCriticFindings | null;
  critic_status?: string | null;
  behavioral_profile?: BehavioralProfile | null;
  behavioral_findings?: BehavioralFindings | null;
  behavioral_status?: string | null;
  final_report?: FinalPortfolioReport | null;
  final_advisor_status?: string | null;
};

export type AgentResumeRequest = {
  thread_id: string;
  questionnaire_responses: BehavioralQuestionnaireResponse;
};

export type UserPublic = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
};

export type GuestPublic = {
  id: string;
  expires_at: string;
  created_at: string;
};

export type GuestCounts = {
  portfolios: number;
  analyses: number;
  reports: number;
};

export type AuthMeResponse = {
  authenticated: boolean;
  user?: UserPublic | null;
  guest?: GuestPublic | null;
  guest_conversion_available: boolean;
  guest_counts?: GuestCounts | null;
  auth_session_expires_at?: string | null;
  guest_session_expires_at?: string | null;
};

export type AuthActionResponse = {
  user: UserPublic;
  guest_conversion_available: boolean;
  guest_counts?: GuestCounts | null;
};

export type GuestConvertResponse = {
  converted: boolean;
  already_converted: boolean;
  counts: GuestCounts;
};

export type PortfolioDetail = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  holdings: ConfirmedHolding[];
  analysis_count: number;
  latest_report_id: string | null;
};

export type PortfolioListResponse = {
  portfolios: PortfolioDetail[];
};

export type AnalysisRunSummary = {
  id: string;
  portfolio_id: string;
  portfolio_name: string;
  thread_id: string;
  status: string;
  workflow_stage: string | null;
  pending_questionnaire: boolean;
  report_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AnalysisDetail = AnalysisRunSummary & {
  analysis: AgentAnalyzeResponse | null;
};

export type AnalysisListResponse = {
  analyses: AnalysisRunSummary[];
};

export type ReportSummary = {
  id: string;
  analysis_run_id: string;
  portfolio_id: string;
  portfolio_name: string;
  title: string;
  status: string;
  is_partial: boolean;
  created_at: string;
};

export type ReportDetail = ReportSummary & {
  analysis: AgentAnalyzeResponse;
  metrics: PortfolioAnalyzeResponse | null;
  sources: Record<string, any>[];
};

export type ReportListResponse = {
  reports: ReportSummary[];
};
