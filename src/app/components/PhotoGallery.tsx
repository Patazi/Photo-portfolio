'use client';

import { useState, useEffect, useRef } from 'react';
import { CldImage } from 'next-cloudinary';
import { usePortfolio } from '../context/PortfolioContext';

interface Photo {
  id: string;
  publicId: string;
  alt: string;
  category?: string;
  description?: string;
  width: number;
  height: number;
  format: string;
  url: string;
}

export default function PhotoGallery() {
  const { 
    photos, 
    setPhotos, 
    selectedCategory, 
    setSelectedCategory
  } = usePortfolio();
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isSpinnerVisible, setIsSpinnerVisible] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [loadedThumbnails, setLoadedThumbnails] = useState<Set<string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedPhotos = useRef(false);

  // 禁用右鍵選單和拖拽
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (photos.length > 0 || hasLoadedPhotos.current) {
        return;
      }

      try {
        const response = await fetch('/api/photos');
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        const data = await response.json();
        setPhotos(data.photos);
        hasLoadedPhotos.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load photos');
      }
    };

    fetchPhotos();
  }, [photos.length, setPhotos]);

  // Get unique categories, filtering out undefined and Thumbnail
  const categories = ['all', ...new Set(photos
    .map(photo => photo.category)
    .filter((category): category is string => 
      category !== undefined && category.toLowerCase() !== 'thumbnail'
    ))];

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsLoading(true);
    setIsSpinnerVisible(true);
    setIsImageLoaded(false);
    setShouldAnimate(true);
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setIsLoading(false);
    setTimeout(() => {
      setIsSpinnerVisible(false);
    }, 500);
  };

  const handleThumbnailLoad = (photoId: string) => {
    setLoadedThumbnails(prev => new Set([...prev, photoId]));
  };

  // Filter photos based on selected category
  const filteredPhotos = photos.filter(photo => 
    (selectedCategory === 'all' || photo.category === selectedCategory) &&
    photo.category?.toLowerCase() !== 'thumbnail'
  );

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setIsInitialLoad(false);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredPhotos.map((photo, index) => {
          const aspectRatio = photo.width / photo.height;
          const isPortrait = aspectRatio < 1;
          const isThumbnailLoaded = loadedThumbnails.has(photo.id);
          const animationDelay = isInitialLoad ? `${index * 0.1}s` : '0s';
          
          return (
            <div
              key={photo.id}
              className={`overflow-hidden rounded-lg shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105 ${
                isPortrait ? 'md:col-span-1 md:row-span-2' : ''
              }`}
              style={{
                opacity: 0,
                animation: `fadeInUp 0.6s ease-out ${animationDelay} forwards`
              }}
              onClick={() => handlePhotoClick(photo)}
            >
              <div 
                className="relative w-full" 
                style={{ 
                  aspectRatio: isPortrait ? '2/3' : '4/3'
                }}
              >
                <div className={`absolute inset-0 bg-gray-100 transition-opacity duration-500 ${
                  isThumbnailLoaded ? 'opacity-0' : 'opacity-100'
                }`} />
                <CldImage
                  src={photo.publicId}
                  alt={photo.alt}
                  fill
                  className={`object-cover transition-all duration-500 ${
                    isPortrait ? 'scale-[1.15]' : ''
                  } ${
                    isThumbnailLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  crop="fill"
                  quality="auto"
                  format="auto"
                  loading="eager"
                  onLoad={() => handleThumbnailLoad(photo.id)}
                />
              </div>
              {photo.description && (
                <div className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{photo.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fullscreen Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              className="absolute top-8 right-8 text-gray-900 text-2xl hover:text-gray-600 transition-colors z-50"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>
            <div className="relative w-full h-full max-w-7xl max-h-[calc(100vh-2rem)]">
              {isSpinnerVisible && (
                <div className={`absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 transition-opacity duration-300 ${
                  isLoading ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-[spin_2s_linear_infinite]" />
                </div>
              )}
              <CldImage
                src={selectedPhoto.publicId}
                alt={selectedPhoto.alt}
                fill
                className={`object-contain transition-all ${
                  shouldAnimate ? 'duration-1000 ease-out' : 'duration-0'
                } ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="100vw"
                priority
                quality="auto"
                format="auto"
                onLoad={handleImageLoad}
              />
              {selectedPhoto.description && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm">
                  <p className="text-gray-900 text-lg">{selectedPhoto.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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