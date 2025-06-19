import Image from "next/image";
import Link from "next/link";

function Logo() {
  return (
    <div className="pt-2">
      <Link href="/">
        <Image src="/logo4.png" alt="CaredXpert logo" height="80" width="138" />
      </Link>
    </div>
  );
}

export default Logo;
