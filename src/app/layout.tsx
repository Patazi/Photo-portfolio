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
  title: "Pearce Lee Photography",
  description: "A professional photography portfolio by Pearce Lee. Architectural, landscape, and creative works.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
        suppressHydrationWarning
      >
        <nav className="w-full flex justify-between items-center px-8 py-6 fixed top-0 left-0 bg-white/80 z-50 border border-gray-100 shadow-lg rounded-b-xl backdrop-blur transition-all">
          <div className="text-2xl font-extrabold tracking-wider text-gray-900 select-none">
            <Link href="/">Pearce Lee</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/portfolio" className="relative text-gray-900 font-medium after:content-[''] after:block after:w-0 after:h-0.5 after:bg-gray-900 after:transition-all after:duration-300 hover:after:w-full hover:after:h-0.5 hover:after:bg-gradient-to-r hover:after:from-gray-900 hover:after:to-gray-700">Portfolio</Link>
            <Link href="/contact" className="relative text-gray-900 font-medium after:content-[''] after:block after:w-0 after:h-0.5 after:bg-gray-900 after:transition-all after:duration-300 hover:after:w-full hover:after:h-0.5 hover:after:bg-gradient-to-r hover:after:from-gray-900 hover:after:to-gray-700">Contact</Link>
            <a href="https://instagram.com/tzehowlee" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="group">
              <span className="inline-flex items-center justify-center rounded-full p-1 transition-all duration-300 group-hover:bg-gray-100 group-hover:shadow-lg">
                <FaInstagram size={24} className="text-gray-900 transition-colors group-hover:text-gray-700" />
              </span>
            </a>
          </div>
        </nav>
        <main className="pt-24 max-w-4xl mx-auto px-4">{children}</main>
      </body>
    </html>
  );
}
