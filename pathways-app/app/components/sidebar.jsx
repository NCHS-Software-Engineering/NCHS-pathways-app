import Link from "next/link";

export default function SideBar() {
  return (
    <aside>
      <nav>
        <Link  className="active font-normal hover:font-bold" href="/dashboard">Dashboard</Link>
        <Link className="font-normal hover:font-bold" href="/pathways">Pathways</Link>
        <Link className="font-normal hover:font-bold" href="/about">About</Link>
        <Link className="font-normal hover:font-bold" href="/settings">Settings</Link>
      </nav>
    </aside>
  );
}
