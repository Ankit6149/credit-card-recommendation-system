import Image from "next/image";
import Link from "next/link";

function Navigation() {
  return (
    <nav className="w-full">
      <ul className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-5 px-3 py-4 sm:py-6 text-shadow-2xm font-700">
        <li className="w-full sm:w-auto">
          <Link
            href="/"
            className="block w-full sm:w-auto bg-primary-600 px-4 sm:px-4 lg:px-6 py-2 rounded-2xl hover:bg-primary-700 transition-all text-white text-sm lg:text-base text-center"
          >
            Home
          </Link>
        </li>
        <li className="w-full sm:w-auto">
          <Link
            href="/cardsList"
            className="block w-full sm:w-auto bg-primary-600 px-4 sm:px-4 lg:px-6 py-2 rounded-2xl hover:bg-primary-700 transition-all text-white text-sm lg:text-base text-center"
          >
            Credit Cards
          </Link>
        </li>
        <li className="w-full sm:w-auto">
          <Link
            href="/chatbot"
            className="block w-full sm:w-auto bg-accent-700 px-4 sm:px-4 lg:px-6 py-2 rounded-2xl hover:bg-accent-800 transition-all text-white text-sm lg:text-base text-center"
          >
            Ask our AI
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
