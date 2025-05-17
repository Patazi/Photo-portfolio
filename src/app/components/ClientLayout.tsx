'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';
import Image from 'next/image';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    // 獲取 Thumbnail 照片的 URL
    const fetchThumbnailUrls = async () => {
      try {
        const response = await fetch('/api/photos?folder=Thumbnail');
        const data = await response.json();
        if (isMounted) {
          const urls = data.photos.map((photo: { url: string }) => photo.url);
          setThumbnailUrls(urls);
          
          // 使用 next/image 預載入圖片
          const preloadPromises = urls.map((url: string) => {
            return new Promise<void>((resolve) => {
              const img = document.createElement('img');
              img.src = url;
              img.onload = () => resolve();
              img.onerror = () => resolve();
            });
          });

          // 當 Thumbnail 照片載入完成後立即顯示內容
          Promise.all(preloadPromises).then(() => {
            if (isMounted) {
              setIsLoading(false);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching thumbnail URLs:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // 立即開始獲取和預載入 Thumbnail 照片
    fetchThumbnailUrls();

    return () => {
      isMounted = false;
    };
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
        <nav className="w-full flex justify-between items-center px-8 py-6 fixed top-0 left-0 bg-white/80 z-50 border border-gray-100 shadow-lg rounded-b-xl backdrop-blur transition-all">
          <div className="text-2xl font-extrabold tracking-wider text-gray-900 select-none">
            <Link href="/" className="relative after:content-[''] after:block after:w-0 after:h-0.5 after:bg-gray-900 after:transition-all after:duration-300 hover:after:w-full hover:after:h-0.5 hover:after:bg-gradient-to-r hover:after:from-gray-900 hover:after:to-gray-700">Pearce Lee</Link>
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
        <main className="pt-24 max-w-4xl mx-auto px-4">
          {children}
        </main>
      </div>
    </>
  );
} 