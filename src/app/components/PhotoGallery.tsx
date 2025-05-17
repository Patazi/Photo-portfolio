'use client';

import { useState, useEffect } from 'react';
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
  const { photos, setPhotos, selectedCategory, setSelectedCategory } = usePortfolio();
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isSpinnerVisible, setIsSpinnerVisible] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      // 如果已經有照片，直接返回
      if (photos.length > 0) {
        return;
      }

      try {
        const response = await fetch('/api/photos');
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        const data = await response.json();
        setPhotos(data.photos);
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

  // Filter photos by category and exclude Thumbnail
  const filteredPhotos = selectedCategory === 'all'
    ? photos.filter(photo => photo.category?.toLowerCase() !== 'thumbnail')
    : photos.filter(photo => photo.category === selectedCategory);

  // Add this function to handle photo selection
  const handlePhotoClick = (photo: Photo) => {
    setIsLoading(true);
    setIsSpinnerVisible(true);
    setIsImageLoaded(false);
    setSelectedPhoto(photo);
  };

  // Add this function to handle image load
  const handleImageLoad = () => {
    setIsLoading(false);
    // Add a small delay before hiding the spinner
    setTimeout(() => {
      setIsSpinnerVisible(false);
      setIsImageLoaded(true);
    }, 300);
  };

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
            onClick={() => setSelectedCategory(category)}
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
        {filteredPhotos.map((photo) => {
          // Calculate aspect ratio
          const aspectRatio = photo.width / photo.height;
          const isPortrait = aspectRatio < 1;
          
          return (
            <div
              key={photo.id}
              className={`overflow-hidden rounded-lg shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105 ${
                isPortrait ? 'md:col-span-1 md:row-span-2' : ''
              }`}
              onClick={() => handlePhotoClick(photo)}
            >
              <div 
                className="relative w-full" 
                style={{ 
                  aspectRatio: isPortrait ? '2/3' : '4/3'
                }}
              >
                <CldImage
                  src={photo.publicId}
                  alt={photo.alt}
                  fill
                  className={`object-cover ${isPortrait ? 'scale-[1.15]' : ''}`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  crop="fill"
                  quality="auto"
                  format="auto"
                  loading="eager"
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
                className={`object-contain transition-all duration-700 ease-out ${
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
    </>
  );
} 