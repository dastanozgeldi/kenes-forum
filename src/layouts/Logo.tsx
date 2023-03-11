import Image from "next/image";
import Link from "next/link";

export const Logo = ({ withText }: { withText?: boolean }) => (
  <Link
    href="/"
    className="flex items-center space-x-3 p-2 sm:px-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:duration-300"
  >
    <Image src="/logo.png" width={36} height={36} alt="logo" />
    {withText && <span className="text-xl font-bold text-primary">Kenes</span>}
  </Link>
);
