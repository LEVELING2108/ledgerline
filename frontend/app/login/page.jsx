"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import { login } from "../../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 dark:bg-cream-dark transition-colors duration-subtle">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-page-title font-medium text-teal dark:text-teal-dark">
            Ledgerline
          </Link>
          <p className="mt-2 text-body text-muted dark:text-muted-dark">
            Log in to manage your finances
          </p>
        </div>

        <div className="rounded-card border border-hairline bg-surface p-6 dark:border-hairline-dark dark:bg-surface-dark shadow-sm">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-card bg-coral-tint border border-coral/20 p-3 text-caption text-coral dark:bg-coral-tint-dark dark:border-coral-dark/20 dark:text-coral-dark">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1 text-caption text-muted dark:text-muted-dark">
              Email Address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@example.com"
                required
                className="w-full rounded-card border border-hairline bg-cream px-3 py-2 text-body text-ink placeholder:text-muted focus:border-teal dark:border-hairline-dark dark:bg-cream-dark dark:text-ink-dark dark:placeholder:text-muted-dark dark:focus:border-teal-dark"
              />
            </label>

            <label className="block space-y-1 text-caption text-muted dark:text-muted-dark">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-card border border-hairline bg-cream px-3 py-2 text-body text-ink placeholder:text-muted focus:border-teal dark:border-hairline-dark dark:bg-cream-dark dark:text-ink-dark dark:placeholder:text-muted-dark dark:focus:border-teal-dark"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-1.5 rounded-card bg-teal py-2 text-body text-white hover:bg-teal/90 disabled:opacity-50 dark:bg-teal-dark dark:text-cream-dark dark:hover:bg-teal-dark/90"
            >
              {loading ? "Logging in..." : "Log In"} <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-caption text-muted dark:text-muted-dark">
          Don't have an account?{" "}
          <Link href="/register" className="text-teal hover:underline dark:text-teal-dark">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
