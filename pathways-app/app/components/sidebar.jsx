import Link from "next/link";

export default function SideBar() {
  return (
   <aside>
          <nav>
            <Link className="active" href="/dashboard">Dashboard</Link>
            <Link href="/pathways">Pathways</Link>
            <Link href="/about">About</Link>
            <Link href="/settings">Settings</Link>
          </nav>
        </aside>
  );
}
