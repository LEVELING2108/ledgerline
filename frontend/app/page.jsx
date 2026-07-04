"use client";

import Link from "next/link";
import { ArrowRight, Shield, Brain, LineChart, Sparkles, Code2, Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "../components/ThemeToggle";

export default function MarketingLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream text-ink dark:bg-cream-dark dark:text-ink-dark transition-colors duration-subtle">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-20 border-b border-hairline bg-cream/90 dark:border-hairline-dark dark:bg-cream-dark/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-8">
            <span className="text-page-title font-medium text-teal dark:text-teal-dark">Ledgerline</span>
            <nav className="hidden gap-6 md:flex">
              <a href="#features" className="text-body text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark">Features</a>
              <a href="#pricing" className="text-body text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark">Pricing</a>
              <a href="#docs" className="text-body text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark">Docs</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden md:inline-block text-body text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark px-2 py-1"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="hidden md:inline-flex items-center gap-1.5 rounded-card bg-teal px-4 py-2 text-body text-white hover:bg-teal/90 dark:bg-teal-dark dark:text-cream-dark dark:hover:bg-teal-dark/90"
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-card border border-hairline p-2 text-muted hover:bg-hairline/20 dark:border-hairline-dark dark:text-muted-dark md:hidden"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav className="border-t border-hairline bg-cream px-4 py-4 space-y-3 dark:border-hairline-dark dark:bg-cream-dark md:hidden">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-body text-muted dark:text-muted-dark py-1">Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-body text-muted dark:text-muted-dark py-1">Pricing</a>
            <a href="#docs" onClick={() => setMobileMenuOpen(false)} className="block text-body text-muted dark:text-muted-dark py-1">Docs</a>
            <Link
              href="/register"
              className="flex items-center justify-center gap-1.5 rounded-card bg-teal py-2.5 text-body text-white dark:bg-teal-dark dark:text-cream-dark"
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-1 rounded-pill bg-teal-tint px-3 py-1 text-caption text-teal dark:bg-teal-tint-dark dark:text-teal-dark">
            <Sparkles size={12} /> AI-Powered Personal Finance
          </span>
          <h1 className="mt-4 text-[32px] md:text-[48px] font-medium leading-tight tracking-tight text-ink dark:text-ink-dark max-w-2xl mx-auto">
            A calm, numbers-first view of your money.
          </h1>
          <p className="mt-4 text-body text-muted dark:text-muted-dark max-w-lg mx-auto">
            Ingest your statements, auto-categorize spending with hybrid ML models, detect anomalies instantly, and ask questions in plain English.
          </p>
          <div className="mt-8 flex flex-col gap-3 justify-center sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-1.5 rounded-card bg-teal px-6 py-3 text-body font-medium text-white hover:bg-teal/90 dark:bg-teal-dark dark:text-cream-dark dark:hover:bg-teal-dark/90"
            >
              Start Free Trial <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-card border border-hairline bg-surface px-6 py-3 text-body font-medium text-ink hover:bg-surface-muted dark:border-hairline-dark dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-surface-muted-dark"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Product Preview Block (Metrics preview) */}
        <div className="mt-16 md:mt-24 border border-hairline rounded-card bg-surface p-6 dark:border-hairline-dark dark:bg-surface-dark">
          <p className="text-caption text-muted dark:text-muted-dark mb-4 text-center">Interactive Product Preview</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-card border border-hairline bg-surface-muted p-4 dark:border-hairline-dark dark:bg-surface-muted-dark">
              <p className="text-caption text-muted dark:text-muted-dark">This month's spend</p>
              <div className="mt-1 flex items-end justify-between">
                <p className="text-metric text-ink dark:text-ink-dark">₹35,200</p>
                <span className="text-caption text-teal dark:text-teal-dark">↓ 3.2%</span>
              </div>
            </div>
            <div className="rounded-card border border-hairline bg-surface-muted p-4 dark:border-hairline-dark dark:bg-surface-muted-dark">
              <p className="text-caption text-muted dark:text-muted-dark">Next month's forecast</p>
              <div className="mt-1 flex items-end justify-between">
                <p className="text-metric text-ink dark:text-ink-dark">₹37,100</p>
                <span className="text-caption text-coral dark:text-coral-dark">↑ 5.4%</span>
              </div>
            </div>
            <div className="rounded-card border border-hairline bg-surface-muted p-4 dark:border-hairline-dark dark:bg-surface-muted-dark">
              <p className="text-caption text-muted dark:text-muted-dark">Active anomalies</p>
              <div className="mt-1 flex items-end justify-between">
                <p className="text-metric text-coral dark:text-coral-dark">1</p>
                <span className="text-caption text-muted dark:text-muted-dark">needs look</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <section id="features" className="mt-20 md:mt-32">
          <h2 className="text-center text-page-title text-ink dark:text-ink-dark">Engineered for absolute financial clarity</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-card border border-hairline bg-surface p-5 dark:border-hairline-dark dark:bg-surface-dark">
              <div className="flex h-10 w-10 items-center justify-center rounded-card bg-teal-tint text-teal dark:bg-teal-tint-dark dark:text-teal-dark">
                <Brain size={20} />
              </div>
              <h3 className="mt-4 text-section-heading font-medium text-ink dark:text-ink-dark">Hybrid Auto-Categorization</h3>
              <p className="mt-2 text-caption text-muted dark:text-muted-dark">
                Uses a fast local classifier (XGBoost/DistilBERT) with LLM API fallback to cleanly sort every novel transaction description.
              </p>
            </div>
            <div className="rounded-card border border-hairline bg-surface p-5 dark:border-hairline-dark dark:bg-surface-dark">
              <div className="flex h-10 w-10 items-center justify-center rounded-card bg-teal-tint text-teal dark:bg-teal-tint-dark dark:text-teal-dark">
                <Shield size={20} />
              </div>
              <h3 className="mt-4 text-section-heading font-medium text-ink dark:text-ink-dark">Personalized Anomaly Detection</h3>
              <p className="mt-2 text-caption text-muted dark:text-muted-dark">
                Trains an unsupervised IsolationForest model per user to identify unusual transaction sizes, duplicate charges, or temporal spikes.
              </p>
            </div>
            <div className="rounded-card border border-hairline bg-surface p-5 dark:border-hairline-dark dark:bg-surface-dark">
              <div className="flex h-10 w-10 items-center justify-center rounded-card bg-teal-tint text-teal dark:bg-teal-tint-dark dark:text-teal-dark">
                <Code2 size={20} />
              </div>
              <h3 className="mt-4 text-section-heading font-medium text-ink dark:text-ink-dark">Safe Text-to-SQL Agent</h3>
              <p className="mt-2 text-caption text-muted dark:text-muted-dark">
                Ask questions like "how much did I spend on Swiggy?" The agent builds read-only SQL, scopes it strictly to your ID, and returns exact values.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mt-20 md:mt-32 rounded-card bg-teal-tint border border-teal/20 px-6 py-10 text-center dark:bg-teal-tint-dark dark:border-teal-dark/20">
          <h2 className="text-page-title text-teal dark:text-teal-dark font-medium">Ready to master your finances?</h2>
          <p className="mt-2 text-body text-muted dark:text-muted-dark max-w-md mx-auto">
            Take control with our calm, numbers-first interface. Create your account and upload a statement to start.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-1.5 rounded-card bg-teal px-6 py-2.5 text-body font-medium text-white hover:bg-teal/90 dark:bg-teal-dark dark:text-cream-dark dark:hover:bg-teal-dark/90"
          >
            Get Started Now <ArrowRight size={16} />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-surface py-8 dark:border-hairline-dark dark:bg-surface-dark text-center">
        <p className="text-caption text-muted dark:text-muted-dark">© 2026 Ledgerline. Academic B.Tech ECE & B.Sc Data Science Thesis Project.</p>
      </footer>
    </div>
  );
}
