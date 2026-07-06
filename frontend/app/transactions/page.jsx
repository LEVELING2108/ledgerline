"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import NavBar from "../../components/NavBar";
import TransactionRow from "../../components/TransactionRow";
import { getTransactions, updateTransactionCategory } from "../../lib/api";
import { transactions as initialTransactions, categories, categoryColorKey } from "../../lib/mockData";

export default function TransactionsPage() {
  const [rows, setRows] = useState(initialTransactions);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [minAmount, setMinAmount] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      try {
        const txs = await getTransactions({
          category: categoryFilter,
          min_amount: minAmount ? Number(minAmount) : null,
          query: query
        });
        if (txs.length > 0) {
          setRows(txs);
        }
      } catch (e) {
        console.warn("Failed to fetch transactions from server, falling back to mock state filters", e);
      }
    }
    loadTransactions();
  }, [query, categoryFilter, minAmount]);

  // Client-side fallback filtered rows if rows matches initialTransactions
  const filtered = useMemo(() => {
    // If backend returned rows, use them directly (since backend already filtered them)
    // Otherwise fallback to client-side filtering of rows
    const isMock = rows === initialTransactions;
    if (!isMock) return rows;
    
    return rows.filter((t) => {
      const matchesQuery = t.merchant.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
      const matchesAmount = !minAmount || Math.abs(t.amount) >= Number(minAmount);
      return matchesQuery && matchesCategory && matchesAmount;
    });
  }, [rows, query, categoryFilter, minAmount]);

  const updateCategory = async (id, nextCategory) => {
    setRows((prev) => prev.map((t) => (t.id === id ? { ...t, category: nextCategory } : t)));
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
        <p className="text-page-title text-ink dark:text-ink-dark">Transactions</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-card border border-hairline
                          bg-surface px-3 py-2 dark:border-hairline-dark dark:bg-surface-dark">
            <Search size={16} className="text-muted dark:text-muted-dark" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search merchant"
              className="w-full bg-transparent text-body text-ink placeholder:text-muted
                        focus:outline-none dark:text-ink-dark dark:placeholder:text-muted-dark"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-card border border-hairline bg-surface px-3 py-2 text-body text-ink
                      dark:border-hairline-dark dark:bg-surface-dark dark:text-ink-dark"
          >
            <option>All</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
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
                amount={t.amount}
                anomaly={t.anomaly}
                categoryOptions={categories}
                onCategoryChange={(next) => updateCategory(t.id, next)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
