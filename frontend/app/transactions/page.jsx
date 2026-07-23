"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UploadCloud } from "lucide-react";
import NavBar from "../../components/NavBar";
import TransactionRow from "../../components/TransactionRow";
import { getTransactions, updateTransactionCategory } from "../../lib/api";
import { transactions as initialTransactions, categories, banks, categoryColorKey } from "../../lib/mockData";

export default function TransactionsPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [bankFilter, setBankFilter] = useState("All Banks");
  const [monthFilter, setMonthFilter] = useState("All Months");
  const [minAmount, setMinAmount] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    async function loadTransactions() {
      try {
        const txs = await getTransactions({
          category: categoryFilter,
          bank_name: bankFilter,
          month: monthFilter,
          min_amount: minAmount ? Number(minAmount) : null,
          query: query
        });
        setRows(txs);
      } catch (e) {
        console.warn("Failed to fetch transactions from server, falling back to mock state filters", e);
      }
    }
    loadTransactions();
  }, [query, categoryFilter, bankFilter, monthFilter, minAmount]);

  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    rows.forEach((r) => {
      if (r.date && r.date.length >= 7) {
        monthsSet.add(r.date.slice(0, 7));
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((t) => {
      const qLower = query.toLowerCase().trim();
      const matchesQuery = !qLower || 
        t.merchant.toLowerCase().includes(qLower) || 
        t.category.toLowerCase().includes(qLower) || 
        (t.bank_name && t.bank_name.toLowerCase().includes(qLower));
      
      const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
      const matchesBank = bankFilter === "All Banks" || (t.bank_name && t.bank_name.includes(bankFilter));
      const matchesMonth = monthFilter === "All Months" || (t.date && t.date.startsWith(monthFilter));
      const matchesAmount = !minAmount || Math.abs(t.amount) >= Number(minAmount);
      
      return matchesQuery && matchesCategory && matchesBank && matchesMonth && matchesAmount;
    });
  }, [rows, query, categoryFilter, bankFilter, monthFilter, minAmount]);

  const updateCategory = async (id, nextCategory) => {
    setRows((prev) => prev.map((t) => (t.id === id ? { ...t, category: nextCategory } : t)));
    setToast({ show: true, message: `Feedback loop active: Retraining AI model on category '${nextCategory}'...` });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
    try {
      await updateTransactionCategory(id, nextCategory);
    } catch (e) {
      console.error("Failed to update transaction category on backend", e);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-cream-dark">
      <NavBar />
      <main className="mx-auto max-w-5xl space-y-4 px-4 pt-6 pb-24 md:py-6 md:px-6">
        <div className="flex items-center justify-between">
          <p className="text-page-title text-ink dark:text-ink-dark">Transactions</p>
          <button
            onClick={() => router.push("/onboarding")}
            className="inline-flex items-center gap-2 rounded-card bg-teal px-4 py-2 text-body font-medium text-white shadow-sm hover:bg-teal/90 dark:bg-teal-dark dark:hover:bg-teal-dark/90 transition-all duration-subtle"
          >
            <UploadCloud size={18} />
            <span>Upload Statement</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-card border border-hairline
                          bg-surface px-3 py-2 dark:border-hairline-dark dark:bg-surface-dark">
            <Search size={16} className="text-muted dark:text-muted-dark" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search merchant, bank, category"
              className="w-full bg-transparent text-body text-ink placeholder:text-muted
                        focus:outline-none dark:text-ink-dark dark:placeholder:text-muted-dark"
            />
          </div>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="rounded-card border border-hairline bg-surface px-3 py-2 text-body text-ink
                      dark:border-hairline-dark dark:bg-surface-dark dark:text-ink-dark"
          >
            <option>All Months</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-card border border-hairline bg-surface px-3 py-2 text-body text-ink
                      dark:border-hairline-dark dark:bg-surface-dark dark:text-ink-dark"
          >
            <option>All Categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
            className="rounded-card border border-hairline bg-surface px-3 py-2 text-body text-ink
                      dark:border-hairline-dark dark:bg-surface-dark dark:text-ink-dark"
          >
            <option>All Banks</option>
            {banks.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>

          <input
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="Min amount ₹"
            className="w-32 rounded-card border border-hairline bg-surface px-3 py-2 text-body
                      text-ink placeholder:text-muted dark:border-hairline-dark
                      dark:bg-surface-dark dark:text-ink-dark dark:placeholder:text-muted-dark"
          />
        </div>

        <div className="rounded-card border border-hairline bg-surface px-2
                        dark:border-hairline-dark dark:bg-surface-dark">
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-body text-muted dark:text-muted-dark">
              No transactions match these filters.
            </p>
          ) : (
            filtered.map((t) => (
              <TransactionRow
                key={t.id}
                date={t.date}
                merchant={t.merchant}
                category={t.category}
                categoryTone={categoryColorKey(t.category)}
                bankName={t.bank_name || "HDFC Bank"}
                amount={t.amount}
                anomaly={t.anomaly}
                categoryOptions={categories}
                onCategoryChange={(next) => updateCategory(t.id, next)}
              />
            ))
          )}
        </div>
      </main>

      {/* Active Learning Feedback Toast */}
      {toast.show && (
        <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-card border
                        border-teal/20 bg-teal-tint px-4 py-3 text-body text-teal shadow-lg
                        dark:border-teal-dark/20 dark:bg-teal-tint-dark dark:text-teal-dark
                        transition-all duration-subtle animate-pulse">
          <span className="h-2.5 w-2.5 rounded-full bg-teal dark:bg-teal-dark" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
