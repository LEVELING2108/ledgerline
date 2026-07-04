import { AlertTriangle } from "lucide-react";

/**
 * AlertBanner — only render this when an anomaly genuinely exists.
 * @param {string} headline - short, direct statement of what happened
 * @param {string} detail - one line of supporting detail
 * @param {() => void} [onView] - optional action, e.g. "View" → Alerts screen
 */
export default function AlertBanner({ headline, detail, onView }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-card border border-coral/30 bg-coral-tint p-4
                dark:border-coral-dark/30 dark:bg-coral-tint-dark"
    >
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-coral dark:text-coral-dark" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-body font-medium text-coral dark:text-coral-dark">{headline}</p>
        <p className="text-caption text-ink/80 dark:text-ink-dark/80">{detail}</p>
      </div>
      {onView && (
        <button
          onClick={onView}
          className="shrink-0 rounded-card border border-coral/40 px-3 py-1 text-caption
                    text-coral hover:bg-coral/10 dark:border-coral-dark/40 dark:text-coral-dark
                    dark:hover:bg-coral-dark/10"
        >
          View
        </button>
      )}
    </div>
  );
}
