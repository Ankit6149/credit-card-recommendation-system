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
    <ul className="flex gap-5 px-3 py-6 text-shadow-2xm font-700">
      <li>
        <Link
          href="/"
          className="bg-primary-600 px-6 py-2 rounded-2xl hover:bg-primary-700 transition-all"
        >
          Home
        </Link>
      </li>
      <li>
        <Link
          href="/cardsList"
          className="bg-primary-600 px-6 py-2 rounded-2xl hover:bg-primary-700 transition-all"
        >
          Credit Cards
        </Link>
      </li>
      <li>
        <Link
          href="/chatbot"
          className="bg-accent-700 px-6 py-2 rounded-2xl hover:bg-accent-800 transition-all"
        >
          Ask our AI
        </Link>
      </li>
    </ul>
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
