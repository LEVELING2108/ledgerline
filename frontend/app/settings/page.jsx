"use client";

import { useState } from "react";
import { Download, Trash2, Plus } from "lucide-react";
import NavBar from "../../components/NavBar";
import { getTransactions } from "../../lib/api";
import { categories as initialCategories } from "../../lib/mockData";

function SectionCard({ title, children }) {
  return (
    <section className="rounded-card border border-hairline bg-surface p-4
                        dark:border-hairline-dark dark:bg-surface-dark">
      <p className="text-section-heading text-ink dark:text-ink-dark">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

const inputClass =
  "w-full rounded-card border border-hairline bg-cream px-3 py-2 text-body text-ink " +
  "placeholder:text-muted focus:border-teal dark:border-hairline-dark dark:bg-cream-dark " +
  "dark:text-ink-dark dark:placeholder:text-muted-dark dark:focus:border-teal-dark";

export default function SettingsPage() {
  const [cats, setCats] = useState(initialCategories);
  const [newCat, setNewCat] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExport = async () => {
    try {
      const transactions = await getTransactions();
      if (!transactions || transactions.length === 0) {
        alert("No transactions found to export. Please import a statement first!");
        return;
      }
      
      const headers = ["date", "merchant", "amount", "category", "anomaly", "source"];
      const csvRows = [headers.join(",")];
      
      for (const t of transactions) {
        const values = headers.map(header => {
          const val = t[header];
          if (typeof val === "string") {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        });
        csvRows.push(values.join(","));
      }
      
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "ledgerline_transactions_export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Failed to export transactions:", e);
      alert("Failed to export data: " + e.message);
    }
  };

  const renameCategory = (index, value) => {
    setCats((prev) => prev.map((c, i) => (i === index ? value : c)));
  };

  const removeCategory = (index) => {
    setCats((prev) => prev.filter((_, i) => i !== index));
  };

  const addCategory = () => {
    if (!newCat.trim()) return;
    setCats((prev) => [...prev, newCat.trim()]);
    setNewCat("");
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-cream-dark">
      <NavBar />
      <main className="mx-auto max-w-3xl space-y-5 px-4 pt-6 pb-24 md:py-6 md:px-6">
        <p className="text-page-title text-ink dark:text-ink-dark">Settings</p>

        <SectionCard title="Profile">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-caption text-muted dark:text-muted-dark">
              Name
              <input className={inputClass} defaultValue="Sourav Kumar" />
            </label>
            <label className="space-y-1 text-caption text-muted dark:text-muted-dark">
              Email
              <input className={inputClass} defaultValue="sourav@example.com" />
            </label>
          </div>
          <button className="mt-3 rounded-card bg-teal px-4 py-2 text-body text-white
                             hover:bg-teal/90 dark:bg-teal-dark dark:hover:bg-teal-dark/90">
            Save changes
          </button>
        </SectionCard>

        <SectionCard title="Categories">
          <ul className="space-y-2">
            {cats.map((c, i) => (
              <li key={`${c}-${i}`} className="flex items-center gap-2">
                <input
                  value={c}
                  onChange={(e) => renameCategory(i, e.target.value)}
                  className={inputClass}
                />
                <button
                  onClick={() => removeCategory(i)}
                  aria-label={`Remove ${c}`}
                  className="shrink-0 rounded-card border border-hairline p-2 text-muted
                            hover:bg-hairline/30 dark:border-hairline-dark dark:text-muted-dark
                            dark:hover:bg-hairline-dark/30"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="New category name"
              className={inputClass}
            />
            <button
              onClick={addCategory}
              className="flex shrink-0 items-center gap-1 rounded-card border border-teal
                        px-3 py-2 text-body text-teal hover:bg-teal-tint dark:border-teal-dark
                        dark:text-teal-dark dark:hover:bg-teal-tint-dark"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <p className="mt-2 text-caption text-muted dark:text-muted-dark">
            Merge two categories by giving them the same name — matching transactions combine automatically.
          </p>
        </SectionCard>

        <SectionCard title="Your data">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-card border border-hairline px-4 py-2
                       text-body text-ink hover:bg-surface-muted dark:border-hairline-dark
                       dark:text-ink-dark dark:hover:bg-surface-muted-dark transition-all duration-subtle"
          >
            <Download size={16} /> Export all data (CSV)
          </button>
        </SectionCard>

        <SectionCard title="Delete account">
          <p className="text-body text-muted dark:text-muted-dark">
            This permanently removes your transactions, categories, and chat history. This cannot be undone.
          </p>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="mt-3 rounded-card border border-coral px-4 py-2 text-body text-coral
                        hover:bg-coral-tint dark:border-coral-dark dark:text-coral-dark
                        dark:hover:bg-coral-tint-dark"
            >
              Delete my account
            </button>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <button className="rounded-card bg-coral px-4 py-2 text-body text-white
                                 hover:bg-coral/90 dark:bg-coral-dark dark:hover:bg-coral-dark/90">
                Confirm deletion
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-card border border-hairline px-4 py-2 text-body text-muted
                          dark:border-hairline-dark dark:text-muted-dark"
              >
                Cancel
              </button>
            </div>
          )}
        </SectionCard>
      </main>
    </div>
  );
}
