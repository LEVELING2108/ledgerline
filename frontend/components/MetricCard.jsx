// Signature detail: a hairline sparkline sits beside the number rather than
// a full chart taking over the card — it supports the figure, never replaces it.
function Sparkline({ points, tone }) {
  if (!points || points.length < 2) return null;
  const w = 64;
  const h = 20;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  const strokeClass = tone === "coral" ? "stroke-coral dark:stroke-coral-dark" : "stroke-teal dark:stroke-teal-dark";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden="true">
      <polyline
        points={coords}
        fill="none"
        className={strokeClass}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * MetricCard
 * @param {string} label - caption above the number, e.g. "This month's spend"
 * @param {string} value - the exact figure, already formatted (e.g. "₹35,200")
 * @param {string} [deltaLabel] - short plain-language comparison, e.g. "vs ₹36,400 last month"
 * @param {"positive"|"negative"|"neutral"} [tone] - meaning of the delta, drives color
 * @param {number[]} [trend] - optional series for the hairline sparkline
 */
export default function MetricCard({ label, value, deltaLabel, tone = "neutral", trend }) {
  const deltaColor =
    tone === "negative"
      ? "text-coral dark:text-coral-dark"
      : tone === "positive"
      ? "text-teal dark:text-teal-dark"
      : "text-muted dark:text-muted-dark";

  return (
    <div className="rounded-card border border-hairline bg-surface-muted p-4
                    dark:border-hairline-dark dark:bg-surface-muted-dark
                    hover:scale-[1.02] hover:shadow-sm hover:border-teal/30 dark:hover:border-teal-dark/30
                    transition-all duration-300 ease-out cursor-default">
      <p className="text-caption text-muted dark:text-muted-dark">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-metric text-ink dark:text-ink-dark">{value}</p>
        {trend && <Sparkline points={trend} tone={tone === "negative" ? "coral" : "teal"} />}
      </div>
      {deltaLabel && <p className={`mt-1 text-caption ${deltaColor}`}>{deltaLabel}</p>}
    </div>
  );
}
