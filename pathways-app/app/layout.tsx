import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import AppShell from "./components/AppShell";



const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pathways Portal",
  description: "Student pathway planning tool",
  icons: {
    icon: "/images/icon.png",
    shortcut: "/images/icon.png",
    apple: "/images/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-(--bg-primary) text-(--text-primary) transition-colors duration-300">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-64 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:border focus:rounded-md"
        >
          Skip to main content
        </a>

        <Providers>
          <AppShell>
            <main id="main-content" tabIndex={-1} className="outline-none">
              {children}
            </main>
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}