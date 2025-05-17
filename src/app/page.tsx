'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { useThumbnail } from "./context/ThumbnailContext";

export default function Home() {
  const { thumbnailPhoto } = useThumbnail();
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 檢查是否為手機版
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 初始檢查
    checkMobile();

    // 監聽視窗大小變化
    window.addEventListener('resize', checkMobile);

    // 清理事件監聽器
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // 如果已經有 thumbnail 照片，直接設置 loading 為 false
    if (thumbnailPhoto) {
      setLoading(false);
    }
  }, [thumbnailPhoto]);

  // 獲取當前要顯示的照片URL
  const getThumbnailUrl = () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const imageName = isMobile ? 'vertical' : 'horizontal';
    const url = `https://res.cloudinary.com/${cloudName}/image/upload/portfolio/Thumbnail/${imageName}`;
    console.log('Loading thumbnail URL:', url);
    return url;
  };

  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden">
      <div className="relative w-full h-full">
        {loading ? (
          <div className="w-full h-full bg-gray-100 animate-pulse" />
        ) : thumbnailPhoto ? (
          <Image
            src={getThumbnailUrl()}
            alt="Background showcase"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onError={(error) => {
              console.error('Error loading image:', error);
            }}
          />
        ) : (
          <Image
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
            alt="Default background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 w-full">
          <div className="relative w-full">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/20 to-transparent" style={{ height: 'calc(100% + 20px)', top: '-20px' }} />
            <div className="relative p-8 pb-[calc(env(safe-area-inset-bottom)+6rem)] w-full pointer-events-none">
              <p className="text-2xl md:text-3xl mb-2 font-['Playfair_Display'] italic tracking-wide text-white drop-shadow-lg">
                Fiat lux, et per lentem lucem persequor.
              </p>
              <p className="text-lg md:text-xl text-gray-200">
                &ldquo;Let there be light, and through the lens I pursue it.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
