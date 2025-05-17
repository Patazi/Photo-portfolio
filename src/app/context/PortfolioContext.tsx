import { createContext, useContext, useState, ReactNode } from 'react';

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

interface PortfolioContextType {
  photos: Photo[];
  setPhotos: (photos: Photo[]) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  return (
    <PortfolioContext.Provider value={{ 
      photos, 
      setPhotos, 
      selectedCategory, 
      setSelectedCategory
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
} 