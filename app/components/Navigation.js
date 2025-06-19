"use client";
import Link from "next/link";
import { useState } from "react";

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="relative">
      {/* Desktop Navigation - Hidden on screens less than 640px */}
      <ul className="hidden sm:flex gap-5 px-3 py-6 text-shadow-2xm font-700">
        <li>
          <Link
            href="/"
            className="bg-primary-600 px-6 py-2 rounded-2xl hover:bg-primary-700 transition-all text-white"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/cardsList"
            className="bg-primary-600 px-6 py-2 rounded-2xl hover:bg-primary-700 transition-all text-white"
          >
            Credit Cards
          </Link>
        </li>
        <li>
          <Link
            href="/chatbot"
            className="bg-accent-700 px-6 py-2 rounded-2xl hover:bg-accent-800 transition-all text-white"
          >
            Ask our AI
          </Link>
        </li>
      </ul>

      {/* List Icon - Shows on screens less than 640px with reduced padding */}
      <div className="sm:hidden px-4 py-4 flex justify-start pl-6">
        <button
          onClick={toggleMenu}
          className="px-3 py-2 rounded-2xl hover:bg-gray-100 transition-all"
          aria-label="Toggle menu"
        >
          <svg
            className="w-8 h-8 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown Menu - Moved towards right */}
      {isMenuOpen && (
        <div className="absolute top-full right-6 transform translate-x-0 sm:hidden bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg mt-2 z-50 w-72 shadow-xl">
          <ul className="flex flex-col gap-2 p-3">
            <li>
              <Link
                href="/"
                onClick={closeMenu}
                className="block px-6 py-3 bg-primary-600/80 backdrop-blur-sm rounded-2xl text-white hover:bg-primary-700/90 transition-all text-center text-lg font-semibold"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/cardsList"
                onClick={closeMenu}
                className="block px-6 py-3 bg-primary-600/80 backdrop-blur-sm rounded-2xl text-white hover:bg-primary-700/90 transition-all text-center text-lg font-semibold"
              >
                Credit Cards
              </Link>
            </li>
            <li>
              <Link
                href="/chatbot"
                onClick={closeMenu}
                className="block px-6 py-3 bg-accent-700/80 backdrop-blur-sm rounded-2xl text-white hover:bg-accent-800/90 transition-all text-center text-lg font-semibold"
              >
                Ask our AI
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Navigation;

// import Link from "next/link";

// function Navigation() {
//   return (
//     <ul className="flex gap-5 px-3 py-6 text-shadow-2xm font-700 md:text-sm ">
//       <li>
//         <Link
//           href="/"
//           className="bg-primary-600 px-6 py-2 rounded-2xl hover:bg-primary-700 transition-all"
//         >
//           Home
//         </Link>
//       </li>
//       <li>
//         <Link
//           href="/cardsList"
//           className="bg-primary-600 px-6 py-2 rounded-2xl hover:bg-primary-700 transition-all"
//         >
//           Credit Cards
//         </Link>
//       </li>
//       <li>
//         <Link
//           href="/chatbot"
//           className="bg-accent-700 px-6 py-2 rounded-2xl hover:bg-accent-800 transition-all"
//         >
//           Ask our AI
//         </Link>
//       </li>
//     </ul>
//   );
// }

// export default Navigation;
