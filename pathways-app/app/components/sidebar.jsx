"use client"; 
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function SideBar() {
  const pathname = usePathname();
  const linkClasses = (path) => {
    let baseClasses = "font-normal hover:font-bold dark:bg-black";
    if (pathname === path) {
      baseClasses = "active " + baseClasses;
    }
    return baseClasses;
  }
  return (
    <aside className="">
      <nav >
        <Link className={linkClasses("/dashboard")} href="/dashboard">Dashboard</Link>
        <Link className={linkClasses("/endorsements")} href="/endorsements">Endorsements</Link>
        <Link className={linkClasses("/about")} href="/about">About</Link>
        <Link className={linkClasses("/settings")} href="/settings">Settings</Link>
      </nav>
    </aside>
  );
}
