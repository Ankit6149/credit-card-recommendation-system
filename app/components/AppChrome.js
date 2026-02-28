"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import Logo from "./Logo";

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const isChatbotPage = pathname?.startsWith("/chatbot");
  const [showRouteBar, setShowRouteBar] = useState(false);

  useEffect(() => {
    setShowRouteBar(true);
    const timer = setTimeout(() => setShowRouteBar(false), 520);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <div
        className={`fixed left-0 top-0 z-[70] h-[2px] bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 transition-all duration-500 ${
          showRouteBar ? "w-full opacity-100" : "w-0 opacity-0"
        }`}
      />

      {!isChatbotPage && (
        <header
          className="fixed top-0 left-0 z-50 w-full bg-gradient-to-b from-primary-950 to-transparent py-2.5 sm:py-3"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="absolute inset-0 h-full w-full"
            style={{
              zIndex: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(to bottom, rgba(20,28,36,0.76) 0%, rgba(20,28,36,0.38) 62%, transparent 100%)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              maskImage: "linear-gradient(to bottom, black 64%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 64%, transparent 100%)",
            }}
          />

          <div
            className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8"
            style={{ pointerEvents: "auto", zIndex: 1 }}
          >
            <Logo />
            <Navigation />
          </div>
        </header>
      )}

      <main
        key={pathname}
        className={`${isChatbotPage ? "pt-0 px-0 py-0" : "pt-20 px-3 py-6 sm:px-6 sm:pt-24 lg:px-8"} page-enter flex-1`}
      >
        {children}
      </main>

      {!isChatbotPage && (
        <footer className="container mx-auto px-3 py-3 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-primary-300">
            Copyright by Ankit Bhardwaj
          </p>
        </footer>
      )}
    </div>
  );
}
