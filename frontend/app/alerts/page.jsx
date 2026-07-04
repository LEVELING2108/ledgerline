"use client";

import { useState, useEffect } from "react";
import { ChevronDown, AlertTriangle, Check, X } from "lucide-react";
import NavBar from "../../components/NavBar";
import { getAlerts, updateAlert } from "../../lib/api";
import { alerts as initialAlerts } from "../../lib/mockData";

function AlertCard({ alert, onResolve, onDismiss }) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-hairline bg-surface p-4
                    dark:border-hairline-dark dark:bg-surface-dark">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-coral dark:text-coral-dark" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-body font-medium text-ink dark:text-ink-dark">{alert.title}</p>
        <p className="text-caption text-muted dark:text-muted-dark">{alert.detail}</p>
        <p className="mt-1 text-caption text-muted dark:text-muted-dark">
          {new Date(alert.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
      </div>
      {!alert.resolved && (
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onResolve(alert.id)}
            aria-label="Resolve"
            className="flex h-8 w-8 items-center justify-center rounded-card border border-hairline
                      text-teal hover:bg-teal-tint dark:border-hairline-dark dark:text-teal-dark
                      dark:hover:bg-teal-tint-dark"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => onDismiss(alert.id)}
            aria-label="Dismiss"
            className="flex h-8 w-8 items-center justify-center rounded-card border border-hairline
                      text-muted hover:bg-hairline/30 dark:border-hairline-dark dark:text-muted-dark
                      dark:hover:bg-hairline-dark/30"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function AlertsPage() {
  const [alertsList, setAlerts] = useState(initialAlerts);
  const [resolvedOpen, setResolvedOpen] = useState(false);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await getAlerts();
        if (data.length > 0) {
          setAlerts(data);
        }
      } catch (e) {
        console.warn("Failed to load alerts from backend, using mock defaults", e);
      }
    }
    loadAlerts();
  }, []);

  const open = alertsList.filter((a) => !a.resolved);
  const resolved = alertsList.filter((a) => a.resolved);

  const resolve = async (id) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
    try {
      await updateAlert(id, true);
    } catch (e) {
      console.error("Failed to resolve alert on backend", e);
    }
  };

  const dismiss = async (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`http://localhost:8000/api/v1/alerts/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${window.localStorage.getItem("ledgerline_token")}`
        }
      });
    } catch (e) {
      console.error("Failed to dismiss alert on backend", e);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-cream-dark">
      <NavBar />
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 md:px-6">
        <p className="text-page-title text-ink dark:text-ink-dark">Alerts</p>

        <div className="space-y-3">
          {open.length === 0 ? (
            <p className="rounded-card border border-hairline bg-surface p-4 text-body
                          text-muted dark:border-hairline-dark dark:bg-surface-dark dark:text-muted-dark">
              Nothing needs your attention right now.
            </p>
          ) : (
            open.map((a) => <AlertCard key={a.id} alert={a} onResolve={resolve} onDismiss={dismiss} />)
          )}
        </div>

        {resolved.length > 0 && (
          <div>
            <button
              onClick={() => setResolvedOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-card border
                        border-hairline bg-surface-muted px-4 py-2.5 text-section-heading
                        text-ink dark:border-hairline-dark dark:bg-surface-muted-dark
                        dark:text-ink-dark"
            >
              Resolved ({resolved.length})
              <ChevronDown size={16} className={`transition-transform ${resolvedOpen ? "rotate-180" : ""}`} />
            </button>
            {resolvedOpen && (
              <div className="mt-3 space-y-3">
                {resolved.map((a) => (
                  <AlertCard key={a.id} alert={a} onResolve={resolve} onDismiss={dismiss} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
