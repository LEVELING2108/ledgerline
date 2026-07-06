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
  splitRatio = 1,
  onSplitChange,
}) {
  const shareAmount = amount / splitRatio;

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

      {/* Split Selector */}
      <select
        value={splitRatio}
        onChange={(e) => onSplitChange?.(Number(e.target.value))}
        aria-label={`Split count for ${merchant}`}
        className="rounded-pill border border-hairline bg-cream px-1.5 py-0.5 text-caption
                   text-muted focus:border-teal dark:border-hairline-dark dark:bg-cream-dark
                   dark:text-muted-dark dark:focus:border-teal-dark"
      >
        <option value={1}>No Split</option>
        <option value={2}>1:2 Split</option>
        <option value={3}>1:3 Split</option>
        <option value={4}>1:4 Split</option>
        <option value={5}>1:5 Split</option>
      </select>

      <div className="w-24 shrink-0 text-right">
        <span
          className={`font-medium ${
            anomaly
              ? "text-coral dark:text-coral-dark"
              : "text-ink dark:text-ink-dark"
          }`}
        >
          {rupee(amount)}
        </span>
        {splitRatio > 1 && (
          <p className="text-[11px] leading-tight text-muted dark:text-muted-dark">
            Share: {rupee(shareAmount)}
          </p>
        )}
      </div>
    </div>
  );
}
