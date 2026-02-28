"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import Logo from "./Logo";

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const isChatbotPage = pathname?.startsWith("/chatbot");

  return (
    <div className="min-h-screen flex flex-col">
      {!isChatbotPage && (
        <header
          className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-primary-950 to-transparent bg-opacity-90 flex justify-between px-4 sm:px-8 md:px-16 lg:px-24 py-3"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              zIndex: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(to bottom, rgba(30,41,59,0.7) 0%, rgba(30,41,59,0.3) 60%, transparent 100%)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 60%, transparent 100%)",
            }}
          />

          <div
            className="relative flex w-full items-center justify-between"
            style={{ pointerEvents: "auto", zIndex: 1 }}
          >
            <Logo />
            <Navigation />
          </div>
        </header>
      )}

      <main
        className={`${isChatbotPage ? "pt-0 px-0 py-0" : "pt-24 px-4 sm:px-8 md:px-16 lg:px-24 py-6"} flex-1`}
      >
        {children}
      </main>

      {!isChatbotPage && (
        <footer className="container mx-auto py-2">
          <p className="text-center">Copyright by Ankit Bhardwaj</p>
        </footer>
      )}
    </div>
  );
}
