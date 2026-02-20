"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SideBar from "../components/sidebar.jsx";

export default function SettingsPage() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark");
            setDark(true);
        } else {
            document.documentElement.classList.remove("dark");
            setDark(false);
        }
    }, []);

    function toggleDark() {
        const newDark = !dark;
        setDark(newDark);

        if (newDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }


    }

    return (
        <>
            <header className="text-foreground transition-colors duration-300 dark:bg-gray-700!">
                <h1 className="text-2xl font-bold transition-colors duration-300 dark:text-white!">Pathways Portal</h1>
                <Link className="dark:bg-blue-600! transition-colors duration-300 dark:text-white!" href="/signin">Sign In</Link>
            </header>

            <div className="container dark:bg-gray-200! transition-colors duration-300">
                <SideBar />

                <main className="flex-1 p-8 bg-background text-foreground min-h-screen">
                    <div className="max-w-xl space-y-6">
                        <h2 className="text-2xl font-semibold">Settings</h2>

                        <div onClick={toggleDark}
                            className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Dark Mode</span>

                                <button
                                    className="w-12 h-6 rounded-full bg-border p-1 transition"
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full bg-background transition transform ${dark ? "translate-x-6" : ""
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
