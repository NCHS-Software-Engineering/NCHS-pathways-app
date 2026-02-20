"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, use } from 'react';

export default function SideBar() {
  const pathname = usePathname();
  const linkClasses = (path) => {
    let baseClasses = "font-normal hover:font-bold dark:bg-gray-600 hover:bg-gray-200 dark:text-white! dark:hover:bg-gray-700 rounded-md px-3 py-2 transition-colors duration-300";
    if (pathname === path) {
      baseClasses = "active " + baseClasses;
    }
    return baseClasses;
  }
  useEffect(() => {

    if (typeof window !== 'undefined') {

    }
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
    );

  }, []);



  return (
    <aside className="dark:bg-gray-700! transition-colors duration-300">
      <nav className="">
        <Link className={linkClasses("/dashboard")} href="/dashboard">Dashboard</Link>
        <Link className={linkClasses("/endorsements")} href="/endorsements">Endorsements</Link>
        <Link className={linkClasses("/about")} href="/about">About</Link>
        <Link className={linkClasses("/settings")} href="/settings">Settings</Link>
      </nav>
    </aside>
  );
}
