import Image from "next/image";
import Link from "next/link";

function Logo() {
  return (
    <div className="flex items-center">
      <Link
        href="/"
        className="inline-flex items-center rounded-lg p-1 transition-transform duration-300 hover:scale-[1.02]"
      >
        <Image
          src="/cardxpert-wordmark.svg"
          alt="CardXpert logo"
          height="52"
          width="206"
          className="h-auto w-[148px] sm:w-[176px] lg:w-[206px]"
          priority
        />
      </Link>
    </div>
  );
}

export default Logo;
