"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home", exact: true },
  { href: "/cardsList", label: "Credit Cards" },
  { href: "/chatbot", label: "Ask AI" },
];

function isActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function itemClass(active) {
  if (active) {
    return "rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-4 py-2 text-sm font-semibold text-primary-50 shadow";
  }

  return "rounded-xl px-4 py-2 text-sm font-medium text-primary-200 transition hover:bg-primary-800/70 hover:text-accent-100";
}

function mobileItemClass(active) {
  if (active) {
    return "block rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-4 py-3 text-center text-sm font-semibold text-primary-50";
  }
  return "block rounded-xl border border-primary-700/60 bg-primary-900/70 px-4 py-3 text-center text-sm font-medium text-primary-100 transition hover:border-accent-500/60 hover:text-accent-100";
}

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="relative flex items-center">
      <ul className="hidden sm:flex items-center gap-2 rounded-2xl border border-primary-700/40 bg-primary-900/45 p-2 backdrop-blur-sm">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={itemClass(isActive(pathname, item))}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="sm:hidden">
        <button
          onClick={() => setIsMenuOpen((value) => !value)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-primary-700/60 bg-primary-900/75 text-primary-100 transition hover:border-accent-500/60 hover:text-accent-100"
          aria-label="Toggle navigation menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-primary-700/60 bg-primary-950/95 p-3 shadow-2xl backdrop-blur-lg sm:hidden">
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={mobileItemClass(isActive(pathname, item))}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
