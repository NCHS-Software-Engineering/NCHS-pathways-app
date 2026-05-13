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

  openGraph: {
    title: "Pathways Portal",
    description: "Pathways Portal App, an app that allows students to track their progress toward earning high school diploma endorsements.",
    url: 'https://www.d203careerpathways.org',
    siteName: "Pathways Portal",
    type: 'website',
    images: [
      {/*
        url: 'https://raw.githubusercontent.com/gitdagray/my-blogposts/main/images/og-card.png',
        secureUrl: 'https://raw.githubusercontent.com/gitdagray/my-blogposts/main/images/og-card.png',
        width: 1200,
        height: 630, */
        alt: 'Pathways Portal Preview Image',
      }
    ]
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