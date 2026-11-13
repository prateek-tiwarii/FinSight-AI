"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, LockKeyhole, Mail, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validatePassword(value: string): string | null {
  if (value.length < 10) return "Password must be at least 10 characters.";
  if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter.";
  if (!/[a-z]/.test(value)) return "Include at least one lowercase letter.";
  if (!/[0-9]/.test(value)) return "Include at least one number.";
  if (!/[^A-Za-z0-9]/.test(value)) return "Include at least one symbol.";
  return null;
}

export function AuthDialog() {
  const {
    authDialogOpen,
    authMode,
    setAuthMode,
    closeAuth,
    login,
    register,
    continueAsGuest,
  } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authDialogOpen) return;
    setError(null);
    setPassword("");
    setConfirmPassword("");
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [authDialogOpen, authMode]);

  useEffect(() => {
    if (!authDialogOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAuth();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [authDialogOpen, closeAuth]);

  if (!authDialogOpen) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (authMode === "register" && fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (authMode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      if (authMode === "login") {
        await login(email.trim(), password);
        toast.success("Signed in.");
      } else {
        await register({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          confirm_password: confirmPassword,
        });
        toast.success("Account created.");
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setGuestLoading(true);
    try {
      await continueAsGuest();
      toast.success("Continuing as a guest.");
    } catch (err: any) {
      setError(err?.message || "Could not start a guest session.");
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeAuth();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        className="w-full max-w-md border border-line bg-ivory text-charcoal shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-gold">FinSight account</div>
            <h2 id="auth-dialog-title" className="font-serif text-2xl mt-1">
              {authMode === "login" ? "Sign in" : "Create account"}
            </h2>
          </div>
          <button
            onClick={closeAuth}
            aria-label="Close authentication dialog"
            className="p-1.5 text-charcoal/60 hover:text-charcoal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 border-b border-line text-sm">
          {(["login", "register"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setAuthMode(mode)}
              className={cn(
                "py-2.5 font-medium transition-colors",
                authMode === mode
                  ? "bg-cream text-charcoal border-b-2 border-gold"
                  : "text-charcoal/60 hover:text-charcoal",
              )}
            >
              {mode === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {authMode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="auth-name">Full name</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                <Input
                  id="auth-name"
                  ref={firstFieldRef}
                  className="pl-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  disabled={loading || guestLoading}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="auth-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <Input
                id="auth-email"
                ref={authMode === "login" ? firstFieldRef : undefined}
                type="email"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading || guestLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="auth-password">Password</Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <Input
                id="auth-password"
                type="password"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
                disabled={loading || guestLoading}
              />
            </div>
            {authMode === "register" && (
              <p className="text-[11px] text-charcoal/50">
                At least 10 characters with uppercase, lowercase, number, and symbol.
              </p>
            )}
          </div>

          {authMode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="auth-confirm">Confirm password</Label>
              <Input
                id="auth-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading || guestLoading}
              />
            </div>
          )}

          {error && <Alert variant="error" title="Could not continue">{error}</Alert>}

          <Button type="submit" className="w-full gap-2" disabled={loading || guestLoading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {authMode === "login" ? "Sign in" : "Create account"}
          </Button>

          <div className="relative py-1 text-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
            <span className="relative bg-ivory px-3 text-[11px] font-mono uppercase tracking-wider text-charcoal/50">
              or
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGuest}
            disabled={loading || guestLoading}
          >
            {guestLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue as guest
          </Button>
          <p className="text-[11px] text-charcoal/50 text-center">
            Guest sessions are temporary. Create an account to keep portfolios and reports.
          </p>
        </form>
      </div>
    </div>
  );
}
