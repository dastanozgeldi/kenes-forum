import type { Session } from "next-auth";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  IoList,
  IoLogInOutline,
  IoNewspaperOutline,
  IoPerson,
} from "react-icons/io5";
import { MdWorkOutline } from "react-icons/md";

type HamburgerMenuProps = { session: Session | null };

const HAMBURGER_ITEM =
  "text-lg flex items-center gap-2 p-4 hover:bg-gray-200 dark:hover:bg-gray-700 hover:duration-500";

export const HamburgerMenu = ({ session }: HamburgerMenuProps) => (
  <div className="flex flex-col absolute right-8 top-14 rounded bg-gray-100 dark:bg-gray-800">
    <Link href="/feed" className={HAMBURGER_ITEM}>
      <IoList /> Feed
    </Link>
    <Link href="/workspace" className={HAMBURGER_ITEM}>
      <MdWorkOutline /> Workspace
    </Link>
    <Link href="/news" className={HAMBURGER_ITEM}>
      <IoNewspaperOutline /> News
    </Link>
    {session ? (
      <Link href="/dashboard" className={HAMBURGER_ITEM}>
        <IoPerson /> Dashboard
      </Link>
    ) : (
      <button className={HAMBURGER_ITEM} onClick={() => signIn()}>
        <IoLogInOutline /> Sign In
      </button>
    )}
  </div>
);
