export interface Photo {
  id: string;
  publicId: string;  // Cloudinary public ID
  alt: string;
  category?: string;
  description?: string;
}

export const photos: Photo[] = [
  {
    id: "photo-1",
    publicId: "portfolio/mountain-lake",
    alt: "Mountain landscape with lake",
    category: "landscape",
    description: "Beautiful mountain landscape with a serene lake"
  },
  {
    id: "photo-2",
    publicId: "portfolio/forest-path",
    alt: "Forest path in autumn",
    category: "nature",
    description: "Peaceful forest path during autumn season"
  },
  {
    id: "photo-3",
    publicId: "portfolio/city-skyline",
    alt: "City skyline at sunset",
    category: "urban",
    description: "Urban cityscape during golden hour"
  },
  {
    id: "photo-4",
    publicId: "portfolio/desert-landscape",
    alt: "Desert landscape",
    category: "landscape",
    description: "Vast desert landscape with dramatic lighting"
  },
  {
    id: "photo-5",
    publicId: "portfolio/mountain-range",
    alt: "Mountain range",
    category: "landscape",
    description: "Majestic mountain range at dawn"
  },
  {
    id: "photo-6",
    publicId: "portfolio/lake-reflection",
    alt: "Mountain lake reflection",
    category: "nature",
    description: "Perfect reflection of mountains in a still lake"
  }
]; 