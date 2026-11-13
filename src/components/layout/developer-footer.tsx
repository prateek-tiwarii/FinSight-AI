import { ArrowUpRight, GitBranch } from "lucide-react";

export function DeveloperFooter() {
  return (
    <footer className="no-print border-t border-ivory/10 bg-charcoal text-ivory">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-serif text-lg leading-none">FinSight AI</div>
          <p className="text-[11px] font-mono mt-2 text-stone/60">
            Read-only portfolio intelligence. Not financial advice.
          </p>
        </div>
        <div className="text-xs text-stone/70">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-gold mb-1">
            Designed &amp; developed by
          </div>
          <div className="text-ivory">Prateek Tiwari · Software Developer</div>
          <div className="flex flex-wrap items-center gap-3 mt-2 font-mono text-[11px]">
            <a
              href="https://portfolio-prateek-sigma.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-stone/80 hover:text-gold transition-colors"
            >
              Portfolio <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="https://github.com/prateek-tiwarii"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-stone/80 hover:text-gold transition-colors"
            >
              <GitBranch className="h-3 w-3" /> GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
