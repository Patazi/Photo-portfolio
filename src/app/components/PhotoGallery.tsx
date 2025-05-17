'use client';

import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';

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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/photos');
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        const data = await response.json();
        setPhotos(data.photos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load photos');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // Get unique categories, filtering out undefined
  const categories = ['all', ...new Set(photos
    .map(photo => photo.category)
    .filter((category): category is string => category !== undefined))];

  // Filter photos by category
  const filteredPhotos = selectedCategory === 'all'
    ? photos
    : photos.filter(photo => photo.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="overflow-hidden rounded-lg shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="relative aspect-[4/3]">
              <CldImage
                src={photo.publicId}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                crop="fill"
                quality="auto"
                format="auto"
              />
            </div>
            {photo.description && (
              <div className="p-4">
                <p className="text-sm text-gray-600 line-clamp-2">{photo.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center mt-24"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>
            <div className="relative w-full h-full max-w-7xl max-h-[calc(100vh-6rem)]">
              <CldImage
                src={selectedPhoto.publicId}
                alt={selectedPhoto.alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
                quality="auto"
                format="auto"
              />
              {selectedPhoto.description && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-lg">{selectedPhoto.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 