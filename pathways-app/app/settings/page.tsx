"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SideBar from "../components/sidebar.jsx";

export default function SettingsPage() {
    const [dark, setDark] = useState(false);

    useEffect(() => {

    }, []);

    function toggleDark() {
        document.body.classList.toggle('dark')

    }

    return (
        <>
            {/* Header */}

            <header className="bg-background text-foreground">
                <h1>Pathways Portal</h1>
                <Link href="/signin">Sign In</Link>
            </header>

            <div className="container">
                <SideBar />

                <main className="flex-1 p-8 bg-background text-foreground min-h-screen">
                    <div className="max-w-xl space-y-6">
                        <h2 className="text-2xl font-semibold">Settings</h2>

                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Dark Mode</span>

                                <button
                                    onClick={toggleDark}
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
