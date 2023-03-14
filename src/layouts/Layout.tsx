import Head from "next/head";
import { type FC, type PropsWithChildren, useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Poppins } from "@next/font/google";
import { Sidebar } from "./Sidebar";

export const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const links = [
    { label: "Feed", href: "/" },
    { label: "Workspace", href: "/workspace" },
    { label: "Consiliums", href: "http://localhost:3000/" },
    { label: "AIChatBot", href: "/chatbot" },
  ];

  const [parent] = useAutoAnimate<HTMLDivElement>();

  useEffect(() => setMounted(true), []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Kenes is a note-trader app created to help students all around the world."
        />
        <meta name="author" content="Dastan Özgeldi" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="twitter:title" content="Kenes - Study Efficiently" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@dastanozgeldi" />
        <meta name="twitter:image" content="https://kenes.dosek.xyz/card.png" />
        <meta property="og:site_name" content="Kenes" />
        <meta name="og:title" content="Kenes - Study Efficiently" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://kenes.dosek.xyz/card.png" />
        <title>Kenes - Diagnose Efficiently</title>
      </Head>
      <div className={poppins.className}>
        <div className="flex">
          <div className="fixed w-1/5 border-r border-r-gray-600">
            <Sidebar mounted={mounted} links={links} />
          </div>
          <main ref={parent} className="w-full ml-[20%] p-4 mx-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};
