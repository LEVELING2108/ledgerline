"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ReceiptText, TrendingUp, AlertTriangle, Bot, Settings, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Activity", icon: ReceiptText },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/chat", label: "Chat", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
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
    <>
      <header className="sticky top-0 z-10 border-b border-hairline dark:border-hairline-dark
                          bg-cream/95 dark:bg-cream-dark/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-6">
            <span className="text-page-title text-teal dark:text-teal-dark font-medium">Ledgerline</span>
            <nav className="hidden md:flex gap-1">
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
              className="hidden md:flex rounded-card border border-hairline p-1.5 text-muted hover:text-coral
                         hover:bg-coral-tint dark:border-hairline-dark dark:text-muted-dark
                         dark:hover:text-coral-dark dark:hover:bg-coral-tint-dark transition-colors duration-subtle"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-hairline
                      bg-cream/95 dark:bg-cream-dark/95 backdrop-blur-md px-2 py-1.5
                      flex items-center justify-around md:hidden dark:border-hairline-dark">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-card transition-all ${
                active
                  ? "text-teal dark:text-teal-dark"
                  : "text-muted dark:text-muted-dark"
              }`}
            >
              <Icon size={20} className={active ? "scale-105" : ""} />
              <span className="text-[10px] font-medium tracking-tight">{link.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          title="Log Out"
          className="flex flex-col items-center gap-0.5 px-2.5 py-1 text-muted dark:text-muted-dark hover:text-coral"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium tracking-tight">Exit</span>
        </button>
      </nav>
    </>
  );
