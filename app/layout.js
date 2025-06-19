import Navigation from "./components/Navigation";
import Logo from "./components/Logo";

import "./globals.css";

export const metadata = {
  title: "CardXpert",
  description: "Credit card recomender AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="transition-all">
        <div className="min-h-screen flex flex-col">
          <header
            className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-primary-950 to-transparent bg-opacity-90 flex justify-between px-4 sm:px-8 md:px-16 lg:px-36 py-4"
            style={{ pointerEvents: "none" }}
          >
            {/* Blurred Gradient Background */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                zIndex: 0,
                pointerEvents: "none",
                background:
                  "linear-gradient(to bottom, rgba(30,41,59,0.7) 0%, rgba(30,41,59,0.3) 60%, transparent 100%)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                maskImage:
                  "linear-gradient(to bottom, black 60%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 60%, transparent 100%)",
              }}
            />
            {/* Navigation Content (Not Blurred) */}
            <div
              className="relative flex w-full justify-between items-center"
              style={{ pointerEvents: "auto", zIndex: 1 }}
            >
              <Logo />
              <Navigation />
            </div>
          </header>

          {/* Responsive main padding and top margin to avoid overlap */}
          <main className="pt-24 px-4 sm:px-8 md:px-16 lg:px-36 py-6 flex-1">
            {children}
          </main>
          <footer className="container mx-auto py-2">
            <p className="text-center">Copyright by Ankit Bhardwaj</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
