"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/trends", label: "Trends" },
  { href: "/alerts", label: "Alerts" },
  { href: "/chat", label: "Chat" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar({ userName = "Sourav Kumar" }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ledgerline_token");
    }
    router.push("/");
  };

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 border-b border-hairline dark:border-hairline-dark
                        bg-cream/95 dark:bg-cream-dark/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-6">
          <span className="text-page-title text-teal dark:text-teal-dark font-medium">Ledgerline</span>
          <nav className="hidden gap-1 md:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-card px-3 py-1.5 text-body transition-all duration-subtle ${
                    active
                      ? "bg-teal-tint text-teal dark:bg-teal-tint-dark dark:text-teal-dark"
                      : "text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full
                       bg-teal-tint text-caption font-medium text-teal
                       dark:bg-teal-tint-dark dark:text-teal-dark"
            aria-label={userName}
            title={userName}
          >
            {initials}
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="rounded-card border border-hairline p-1.5 text-muted hover:text-coral
                       hover:bg-coral-tint dark:border-hairline-dark dark:text-muted-dark
                       dark:hover:text-coral-dark dark:hover:bg-coral-tint-dark transition-colors duration-subtle"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Mobile nav: horizontally scrollable row */}
      <nav className="flex gap-1 overflow-x-auto border-t border-hairline px-4 py-2
                      dark:border-hairline-dark md:hidden">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-card px-3 py-1 text-caption ${
                active
                  ? "bg-teal-tint text-teal dark:bg-teal-tint-dark dark:text-teal-dark"
                  : "text-muted dark:text-muted-dark"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
