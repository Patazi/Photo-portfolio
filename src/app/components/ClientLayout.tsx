'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';
import { ThumbnailProvider } from '../context/ThumbnailContext';
import { PortfolioProvider } from '../context/PortfolioContext';
import { useThumbnail } from '../context/ThumbnailContext';
import { usePathname } from 'next/navigation';

// 創建一個內部組件來使用 ThumbnailContext
function ClientLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const { setThumbnailPhoto } = useThumbnail();
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isPortfolioPage = pathname === '/portfolio';
  const isHomePage = pathname === '/';
  const isContactPage = pathname === '/contact';
  const [pearceWidth, setPearceWidth] = useState(0);
  const pearceRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (pearceRef.current) {
      const width = pearceRef.current.offsetWidth;
      setPearceWidth(width);
    }
  }, [isScrolled]);

  useEffect(() => {
    let isMounted = true;

    const preloadThumbnail = async () => {
      try {
        const response = await fetch('/api/photos?folder=Thumbnail');
        if (!response.ok) {
          throw new Error('Failed to fetch thumbnail');
        }
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.photos.length);
          if (isMounted) {
            setThumbnailPhoto(data.photos[randomIndex]);
          }
        }
      } catch (error) {
        console.error('Error preloading thumbnail:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    preloadThumbnail();

    return () => {
      isMounted = false;
    };
  }, [setThumbnailPhoto]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        </div>
      )}
      <div className={`transition-opacity duration-[3000ms] ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="min-h-screen bg-white">
          <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isPortfolioPage 
              ? (isScrolled ? 'h-10 bg-white/60 backdrop-blur-md shadow-sm' : 'h-24 bg-white/60 backdrop-blur-md')
              : 'h-24 bg-white/60 backdrop-blur-md'
          } ${isPortfolioPage ? 'rounded-b-xl' : 'rounded-b-xl'} ${
            (isHomePage || isContactPage) ? 'touch-none' : ''
          }`}
               onTouchMove={(e) => {
                 if (isHomePage || isContactPage) {
                   e.preventDefault();
                 }
               }}>
            <div className="max-w-7xl mx-auto px-4 h-full relative">
              <div className="h-full flex items-center justify-between">
                <Link 
                  href="/" 
                  className={`text-2xl font-extrabold tracking-wider text-gray-900 select-none relative after:content-[''] after:block after:w-0 after:h-0.5 after:bg-gray-900 after:transition-all after:duration-300 hover:after:h-0.5 hover:after:bg-gradient-to-r hover:after:from-gray-900 hover:after:to-gray-700 after:origin-left ${
                    isScrolled && isPortfolioPage ? 'hover:after:w-[var(--pearce-width)]' : 'hover:after:w-full'
                  }`}
                  style={{
                    '--pearce-width': `${pearceWidth}px`
                  } as React.CSSProperties}
                >
                  <span ref={pearceRef}>Pearce</span> <span className={`transition-opacity duration-300 ${isScrolled && isPortfolioPage ? 'opacity-0' : 'opacity-100'}`}>Lee</span>
                </Link>
                <div className="flex items-center gap-6">
                  <Link 
                    href="/portfolio" 
                    className={`relative text-gray-900 font-medium after:content-[''] after:block after:w-0 after:h-0.5 after:bg-gray-900 after:transition-all after:duration-300 hover:after:w-full hover:after:h-0.5 hover:after:bg-gradient-to-r hover:after:from-gray-900 hover:after:to-gray-700 transition-opacity duration-300 flex items-center h-full ${
                      isScrolled && isPortfolioPage ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    Portfolio
                  </Link>
                  <Link href="/contact" className="relative text-gray-900 font-medium after:content-[''] after:block after:w-0 after:h-0.5 after:bg-gray-900 after:transition-all after:duration-300 hover:after:w-full hover:after:h-0.5 hover:after:bg-gradient-to-r hover:after:from-gray-900 hover:after:to-gray-700 flex items-center h-full">
                    Contact
                  </Link>
                  <a href="https://instagram.com/tzehowlee" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="group flex items-center h-full">
                    <span className="inline-flex items-center justify-center rounded-full p-1 transition-all duration-300 group-hover:bg-gray-100 group-hover:shadow-lg">
                      <FaInstagram size={24} className="text-gray-900 transition-colors group-hover:text-gray-700" />
                    </span>
                  </a>
                </div>
              </div>
              {isScrolled && isPortfolioPage && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <h1 className="text-xl font-bold text-gray-900 transition-all duration-300 transform translate-y-0 opacity-0 animate-[slideUp_0.3s_ease-out_forwards]">
                    Portfolio
                  </h1>
                </div>
              )}
            </div>
          </nav>
          <main className={`transition-all duration-300 ${
            isPortfolioPage ? (isScrolled ? 'pt-10' : 'pt-24') : 'pt-24'
          } max-w-4xl mx-auto px-4 ${
            isPortfolioPage ? 'scrollable' : 'no-scroll'
          }`}>
            {children}
          </main>
        </div>
      </div>
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(0);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

// 主組件
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThumbnailProvider>
      <PortfolioProvider>
        <ClientLayoutContent>
          {children}
        </ClientLayoutContent>
      </PortfolioProvider>
    </ThumbnailProvider>
  );
} 