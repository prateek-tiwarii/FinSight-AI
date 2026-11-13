import Link from "next/link";
import { ArrowRight, BarChart3, Bot, CheckCircle2, FileSearch, ShieldCheck, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

const stages = ["Portfolio Analysis", "Market Analyst", "Research Agent", "Risk Critic", "Behavioral Questionnaire", "Behavioral Advisor", "Final Advisor"];

export default function Home() {
  return (
    <div className="bg-ink text-ivory">
      <section className="relative overflow-hidden border-b border-ivory/10">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(249,246,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,246,238,0.5) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
        <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-28 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] items-end">
          <div className="space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-gold"><span className="h-px w-8 bg-gold/60" />FinSight AI</div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl leading-[0.98] text-balance">Upload your portfolio. Let AI agents analyze the bigger picture.</h1>
            <p className="text-base md:text-lg text-stone/80 max-w-2xl leading-relaxed">FinSight AI is an agentic AI portfolio intelligence platform. <span className="text-ivory">See Beyond the Numbers.</span> Extract holdings, validate them, and run a multi-agent workflow for market analysis, news research, risk critique, behavioral alignment, and a final intelligence report.</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/portfolio"><Button size="lg" className="gap-2 bg-ivory text-charcoal hover:bg-cream border border-ivory/0"><UploadCloud className="h-4 w-4" /> Upload portfolio</Button></Link>
              <Link href="/how-it-works"><Button size="lg" variant="outline" className="gap-2 border-ivory/20 text-ivory hover:bg-ivory/5 bg-transparent">How it works <ArrowRight className="h-4 w-4" /></Button></Link>
            </div>
          </div>
          <div className="border border-ivory/10 bg-charcoal/60 p-6 md:p-8 space-y-4 animate-fade-up [animation-delay:120ms]">
            <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.16em] text-stone/70"><Bot className="h-4 w-4 text-gold" /> Multi-agent workflow</div>
            <ol className="space-y-3">
              {stages.map((s, i) => (
                <li key={s} className="flex items-center gap-4 text-sm">
                  <span className="h-7 w-7 rounded-sm border border-gold/30 text-gold font-mono text-xs flex items-center justify-center bg-gold/5">{String(i+1).padStart(2,"0")}</span>
                  <span className="text-ivory/90">{s}</span>
                </li>
              ))}
            </ol>
            <p className="text-xs text-stone/60 pt-2 border-t border-ivory/10 font-mono">Human-in-the-loop preferences · read-only intelligence</p>
          </div>
        </div>
      </section>

      <section className="bg-ivory text-charcoal border-b border-line">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20 grid gap-6 md:grid-cols-3">
          {[{icon:FileSearch,title:"Screenshot extraction",body:"Upload a Groww portfolio screenshot (PNG, JPG, JPEG, WEBP). Review and correct extracted holdings before any analysis runs."},{icon:BarChart3,title:"Deterministic + agentic insights",body:"Portfolio metrics are computed deterministically. Market, research, critic, behavioral, and final advisor agents provide evidence-backed interpretations."},{icon:ShieldCheck,title:"Read-only & transparent",body:"FinSight AI does not execute trades or provide guaranteed-return advice. Warnings, missing data, and source limitations are surfaced clearly."}].map((c,i)=> (
            <div key={c.title} className="border border-line bg-cream/50 p-6 space-y-3 animate-fade-up" style={{animationDelay:`${i*80}ms`}}>
              <c.icon className="h-5 w-5 text-gold" />
              <h3 className="font-serif text-2xl">{c.title}</h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-charcoal text-ivory border-b border-ivory/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-18 space-y-6">
          <div className="border border-ivory/10 p-6 md:p-8 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-gold">Supported input & privacy</div>
            <p className="text-sm md:text-base text-stone/80 leading-relaxed max-w-4xl">Supported input: Groww portfolio screenshots (PNG, JPG, JPEG, WEBP, up to 10 MB). Market prices are latest available via yfinance (not live). News is retrieved from Google News RSS metadata. Uploaded screenshots and portfolio data are used for read-only analysis in this MVP and are not permanently stored by the app.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone/70"><CheckCircle2 className="h-4 w-4 text-sage" /><span>Always review extracted holdings and confirm before starting analysis.</span></div>
        </div>
      </section>
    </div>
  );
}
