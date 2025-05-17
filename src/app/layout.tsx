import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tzehow Lee Photography",
  description: "A professional photography portfolio by Tzehow Lee. Architectural, landscape, and creative works.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="w-full flex justify-between items-center px-8 py-6 fixed top-0 left-0 bg-white/80 backdrop-blur z-50 border-b border-gray-200">
          <div className="text-xl font-bold tracking-tight">
            <Link href="/">Tzehow Lee</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/portfolio" className="hover:underline">Portfolio</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <a href="https://instagram.com/tzehowlee" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram size={24} className="hover:text-pink-500 transition-colors" />
            </a>
          </div>
        </nav>
        <main className="pt-24">{children}</main>
      </body>
    </html>
  );
}
