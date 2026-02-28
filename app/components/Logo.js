import Image from "next/image";
import Link from "next/link";

function Logo() {
  return (
    <div className="flex items-center">
      <Link href="/" className="inline-flex items-center">
        <Image src="/logo4.png" alt="CaredXpert logo" height="52" width="120" />
      </Link>
    </div>
  );
}

export default Logo;
