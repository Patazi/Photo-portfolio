'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CldImage } from "next-cloudinary";
import { useThumbnail } from "./context/ThumbnailContext";

interface ThumbnailPhoto {
  publicId: string;
  url: string;
}

export default function Home() {
  const { thumbnailPhoto } = useThumbnail();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 如果已經有 thumbnail 照片，直接設置 loading 為 false
    if (thumbnailPhoto) {
      setLoading(false);
    }
  }, [thumbnailPhoto]);

  return (
    <main className="fixed inset-0 w-screen h-screen">
      <div className="relative w-full h-full">
        {loading ? (
          <div className="w-full h-full bg-gray-100 animate-pulse" />
        ) : thumbnailPhoto ? (
          <CldImage
            src={thumbnailPhoto.publicId}
            alt="Background showcase"
            fill
            className="object-cover"
            priority
            sizes="100vw"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient">
            Welcome to Pearce Lee Photography
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            Capturing moments that tell your story
          </p>
          <div className="flex gap-4">
            <Link href="/portfolio" className="btn bg-sky-500/20 backdrop-blur-sm text-white hover:bg-sky-500/30">
              View Portfolio
            </Link>
            <Link href="/contact" className="btn bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
              Contact Me
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
