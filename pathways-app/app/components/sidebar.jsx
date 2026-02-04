"use client"; 
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function SideBar() {
  const pathname = usePathname();
  const linkClasses = (path) => {
    let baseClasses = "font-normal hover:font-bold";
    if (pathname === path) {
      baseClasses = "active " + baseClasses;
    }
    return baseClasses;
  }
  return (
    <aside>
      <nav>
        <Link className={linkClasses("/dashboard")} href="/dashboard">Dashboard</Link>
        <Link className={linkClasses("/pathways")} href="/pathways">Pathways</Link>
        <Link className={linkClasses("/about")} href="/about">About</Link>
        <Link className={linkClasses("/settings")} href="/settings">Settings</Link>
      </nav>
    </aside>
  );
}
