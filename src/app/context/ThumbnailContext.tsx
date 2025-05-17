import { createContext, useContext, useState, ReactNode } from 'react';

interface ThumbnailPhoto {
  publicId: string;
  url: string;
}

interface ThumbnailContextType {
  thumbnailPhoto: ThumbnailPhoto | null;
  setThumbnailPhoto: (photo: ThumbnailPhoto | null) => void;
}

const ThumbnailContext = createContext<ThumbnailContextType | undefined>(undefined);

export function ThumbnailProvider({ children }: { children: ReactNode }) {
  const [thumbnailPhoto, setThumbnailPhoto] = useState<ThumbnailPhoto | null>(null);

  return (
    <ThumbnailContext.Provider value={{ thumbnailPhoto, setThumbnailPhoto }}>
      {children}
    </ThumbnailContext.Provider>
  );
}

export function useThumbnail() {
  const context = useContext(ThumbnailContext);
  if (context === undefined) {
    throw new Error('useThumbnail must be used within a ThumbnailProvider');
  }
  return context;
} 