"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/providers/auth-provider";

export function GuestConversionDialog() {
  const { conversionOpen, closeConversion, convertGuest, me } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!conversionOpen) return null;
  const counts = me?.guest_counts;

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await convertGuest(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["portfolios"] }),
        queryClient.invalidateQueries({ queryKey: ["analyses"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ]);
      toast.success("Guest work merged into your account.");
    } catch (err: any) {
      setError(err?.message || "Could not merge guest work.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) closeConversion();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-conversion-title"
        className="w-full max-w-md border border-line bg-ivory text-charcoal shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-gold">Guest work found</div>
            <h2 id="guest-conversion-title" className="font-serif text-2xl mt-1">
              Merge into your account?
            </h2>
          </div>
          <button
            onClick={closeConversion}
            aria-label="Close guest conversion dialog"
            className="p-1.5 text-charcoal/60 hover:text-charcoal"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-charcoal/70">
            You created work as a guest. Merge it into this account to keep it permanently.
            Existing account data is never overwritten or deleted.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Portfolios", value: counts?.portfolios ?? 0 },
              { label: "Analyses", value: counts?.analyses ?? 0 },
              { label: "Reports", value: counts?.reports ?? 0 },
            ].map((item) => (
              <div key={item.label} className="border border-line bg-cream/40 px-3 py-3">
                <div className="font-serif text-2xl">{item.value}</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-charcoal/50 mt-1">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          {error && <Alert variant="error" title="Merge failed">{error}</Alert>}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={closeConversion} disabled={loading}>
              Not now
            </Button>
            <Button onClick={handleConfirm} disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Merge guest work
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
