"use client";

const rupee = (n) =>
  `${n < 0 ? "-" : ""}₹${Math.abs(n).toLocaleString("en-IN")}`;

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

const tagToneClass = {
  teal: "bg-teal-tint text-teal dark:bg-teal-tint-dark dark:text-teal-dark",
  purple: "bg-purple/10 text-purple dark:bg-purple-dark/15 dark:text-purple-dark",
  coral: "bg-coral-tint text-coral dark:bg-coral-tint-dark dark:text-coral-dark",
  muted: "bg-hairline/40 text-muted dark:bg-hairline-dark/60 dark:text-muted-dark",
};

/**
 * TransactionRow
 * @param {string} date - ISO date
 * @param {string} merchant
 * @param {string} category
 * @param {"teal"|"purple"|"coral"|"muted"} categoryTone
 * @param {number} amount - negative for spend
 * @param {boolean} [anomaly] - renders the amount in the warning color
 * @param {string[]} categoryOptions - full list for the inline correction dropdown
 * @param {(next: string) => void} onCategoryChange
 */
export default function TransactionRow({
  date,
  merchant,
  category,
  categoryTone = "muted",
  amount,
  anomaly = false,
  categoryOptions = [],
  onCategoryChange,
}) {
  return (
    <div
      className="flex items-center gap-3 border-b border-hairline px-2 py-2.5 text-body
                dark:border-hairline-dark last:border-b-0"
    >
      <span className="w-14 shrink-0 text-caption text-muted dark:text-muted-dark">
        {formatDate(date)}
      </span>

      <span className="flex-1 truncate text-ink dark:text-ink-dark">{merchant}</span>

      <select
        value={category}
        onChange={(e) => onCategoryChange?.(e.target.value)}
        aria-label={`Category for ${merchant}`}
        className={`rounded-pill border-0 px-2 py-1 text-caption ${tagToneClass[categoryTone]}`}
      >
        {categoryOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <span
        className={`w-24 shrink-0 text-right font-medium ${
          anomaly
            ? "text-coral dark:text-coral-dark"
            : "text-ink dark:text-ink-dark"
        }`}
      >
        {rupee(amount)}
      </span>
    </div>
  );
}
