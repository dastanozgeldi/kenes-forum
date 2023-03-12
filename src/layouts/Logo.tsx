import Image from "next/image";
import logo from "assets/logo.png";

export const Logo = ({ withText }: { withText?: boolean }) => (
  <div className="flex items-center space-x-3 p-2 sm:px-4">
    <Image src={logo} width={36} height={36} alt="logo" />
    {withText && <span className="text-xl font-bold text-primary">Kenes</span>}
  </div>
);
