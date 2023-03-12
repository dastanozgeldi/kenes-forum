import clsx from "clsx";
import { Avatar } from "components/common/Avatar";
import { ToggleTheme } from "components/common/ToggleTheme";
import { Topics } from "components/feed/Topics";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BiLogInCircle } from "react-icons/bi";
import { FaHome, FaSuitcase, FaVideo } from "react-icons/fa";
import { Logo } from "./Logo";

type SidebarProps = {
  mounted: boolean;
  links: { label: string; href: string }[];
};

export const Sidebar = ({ mounted, links }: SidebarProps) => {
  const { data: session } = useSession();
  const icons = {
    Feed: <FaHome className="text-primary" size={24} />,
    Workspace: <FaSuitcase className="text-primary" size={24} />,
    Consiliums: <FaVideo className="text-primary" size={24} />,
  };

  const [isBigScreen, setIsBigScreen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");

    setIsBigScreen(mediaQuery.matches);

    const handleChange = (event: any) => {
      setIsBigScreen(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <aside className="relative p-4 h-screen">
      <Logo withText={isBigScreen} />
      <div className="flex flex-col my-8">
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className={clsx(
              "text-lg rounded-xl py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700 hover:duration-500",
              "sm:flex sm:items-center sm:gap-3"
            )}
          >
            {/* @ts-ignore */}
            {icons[l.label]} {isBigScreen && l.label}
          </Link>
        ))}
      </div>
      <div className="absolute bottom-0 my-4 p-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-xl">
        <ToggleTheme mounted={mounted} />

        <div className="flex gap-2 items-center justify-around text-3xl md:text-4xl">
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-full hover:ring-2 ring-gray-300"
            >
              <Avatar src={session.user?.image} size={32} />
            </Link>
          ) : (
            <button className="text-xl" onClick={() => signIn()}>
              <BiLogInCircle size={32} />
            </button>
          )}
        </div>
      </div>
      <Topics />
    </aside>
  );
};
