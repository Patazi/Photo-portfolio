'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [failedThumbnails, setFailedThumbnails] = useState<Set<string>>(new Set());
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['all']);
  const hasLoadedPhotos = useRef(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollSpeed = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const INITIAL_LOAD = 20;
  const LOAD_MORE = 20;
  const SCROLL_THRESHOLD = 50; // 降低滾動速度閾值，使預載入更容易觸發
  const PRELOAD_DISTANCE = 0.5; // 降低預載入觸發距離，提前開始載入
  const SCROLL_CHECK_INTERVAL = 100; // 滾動檢查間隔（毫秒）
  const lastScrollCheck = useRef(Date.now());

  // 加載更多照片
  const loadMorePhotos = useCallback(async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const limit = LOAD_MORE;
      
      console.log('Loading more photos, page:', nextPage, 'limit:', limit, 'category:', selectedCategory);
      const response = await fetch(`/api/photos?page=${nextPage}&limit=${limit}&category=${selectedCategory}&t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch more photos: ${response.status}`);
      }

      const data = await response.json();
      console.log('Successfully loaded more photos:', {
        count: data.photos.length,
        hasMore: data.hasMore,
        currentPage: page,
        nextPage,
        timestamp: data.timestamp,
        totalPhotos: photos.length + data.photos.length,
        scrollSpeed: scrollSpeed.current
      });

      // 確保新加載的照片不會與現有照片重複
      const newPhotos = data.photos.filter(
        (newPhoto: Photo) => !photos.some(existingPhoto => existingPhoto.id === newPhoto.id)
      );

      if (newPhotos.length > 0) {
        setPhotos([...photos, ...newPhotos] as Photo[]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      } else {
        console.log('No new photos to add');
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more photos:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, page, selectedCategory, photos, setPhotos]);

  // 監聽滾動事件
  useEffect(() => {
    const handleScroll = () => {
      const currentTime = Date.now();
      const currentScrollY = window.scrollY;
      const timeDiff = currentTime - lastScrollTime.current;
      
      // 計算滾動速度（像素/毫秒）
      scrollSpeed.current = Math.abs(currentScrollY - lastScrollY.current) / timeDiff;
      
      // 更新最後的滾動位置和時間
      lastScrollY.current = currentScrollY;
      lastScrollTime.current = currentTime;

      // 限制檢查頻率
      if (currentTime - lastScrollCheck.current < SCROLL_CHECK_INTERVAL) {
        return;
      }
      lastScrollCheck.current = currentTime;

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.scrollY + windowHeight;
      const scrollPercentage = scrollPosition / documentHeight;

      // 優化預載入觸發條件
      const shouldPreload = (
        // 基於滾動速度的觸發
        (scrollSpeed.current > SCROLL_THRESHOLD && scrollPercentage > PRELOAD_DISTANCE) ||
        // 基於滾動位置的觸發
        scrollPercentage > PRELOAD_DISTANCE ||
        // 基於剩餘內容的觸發
        (documentHeight - scrollPosition) < windowHeight * 2
      );

      if (shouldPreload && hasMore && !isLoadingMore) {
        console.log('Preloading triggered:', {
          speed: scrollSpeed.current,
          scrollPercentage,
          hasMore,
          isLoadingMore,
          remainingDistance: documentHeight - scrollPosition
        });
        loadMorePhotos();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, loadMorePhotos]);

  // 設置 Intersection Observer
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          // 減少延遲時間，使預載入更快觸發
          timeoutId = setTimeout(() => {
            console.log('Intersection observer triggered:', {
              hasMore,
              isLoadingMore,
              currentPage: page,
              category: selectedCategory,
              photosCount: photos.length,
              scrollSpeed: scrollSpeed.current
            });
            loadMorePhotos();
          }, 200); // 減少延遲時間到 200ms
        }
      },
      { 
        threshold: 0.1,  // 降低閾值，使預載入更容易觸發
        rootMargin: '400px'  // 增加提前觸發的距離
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [hasMore, isLoadingMore, selectedCategory, loadMorePhotos, page, photos.length]);

  // 禁用右鍵選單和拖拽
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleTouchStart = (e: TouchEvent) => {
      // 不阻止默認行為，而是使用 CSS 來防止拖拽
      e.stopPropagation();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  // 當類別改變時重置分頁
  useEffect(() => {
    let isMounted = true;  // 添加掛載狀態檢查

    const loadCategoryPhotos = async () => {
      // 重置所有相關狀態
      setPage(1);
      setHasMore(true);
      setIsLoadingMore(true);
      setLoadedThumbnails(new Set());
      setFailedThumbnails(new Set());
      setPhotos([]); // 清空現有照片

      try {
        console.log('Loading photos for category:', selectedCategory);
        const response = await fetch(`/api/photos?page=1&limit=${INITIAL_LOAD}&category=${selectedCategory}&t=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch photos: ${response.status}`);
        }

        const data = await response.json();
        console.log('Successfully loaded category photos:', {
          category: selectedCategory,
          count: data.photos.length,
          hasMore: data.hasMore,
          page: 1,
          timestamp: data.timestamp
        });

        if (isMounted) {  // 只在組件仍然掛載時更新狀態
          if (data.photos && data.photos.length > 0) {
            setPhotos(data.photos);
            setHasMore(data.hasMore);
            hasLoadedPhotos.current = true;
          } else {
            console.log('No photos found for category:', selectedCategory);
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error('Error loading category photos:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load photos');
        }
      } finally {
        if (isMounted) {
          setIsLoadingMore(false);
        }
      }
    };

    loadCategoryPhotos();

    // 清理函數
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, setPhotos]);

  // 初始加載照片
  useEffect(() => {
    const fetchPhotos = async () => {
      if (photos.length > 0 || hasLoadedPhotos.current) {
        return;
      }

      try {
        console.log('Fetching initial photos...');
        const response = await fetch(`/api/photos?page=1&limit=${INITIAL_LOAD}&t=${Date.now()}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Failed to fetch photos:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(`Failed to fetch photos: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Successfully fetched initial photos:', {
          count: data.photos.length,
          hasMore: data.hasMore,
          categories: data.categories,
          timestamp: data.timestamp
        });
        setPhotos(data.photos);
        setHasMore(data.hasMore);
        setAvailableCategories(['all', ...data.categories]);
        hasLoadedPhotos.current = true;
      } catch (err) {
        console.error('Error in fetchPhotos:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
        setError(err instanceof Error ? err.message : 'Failed to load photos');
      }
    };

    fetchPhotos();
  }, [photos.length, setPhotos]);

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
    setLoadedThumbnails(prev => {
      const newSet = new Set(prev);
      newSet.add(photoId);
      return newSet;
    });
    // 添加動畫類
    const element = document.getElementById(`photo-${photoId}`);
    if (element) {
      element.style.animation = `fadeInUp 0.6s ease-out forwards`;
    }
  };

  // Filter photos based on selected category
  const filteredPhotos = photos.filter(photo => 
    (selectedCategory === 'all' || photo.category === selectedCategory) &&
    photo.category?.toLowerCase() !== 'thumbnail' &&
    photo.category?.toLowerCase() !== 'uncategorized'
  );

  // 添加重試機制
  const handleRetry = (photoId: string) => {
    setFailedThumbnails(prev => {
      const newSet = new Set(prev);
      newSet.delete(photoId);
      return newSet;
    });
    setRetryCount(prev => ({
      ...prev,
      [photoId]: (prev[photoId] || 0) + 1
    }));
  };

  // 渲染錯誤狀態的縮略圖
  const renderErrorThumbnail = (photo: Photo) => {
    const retries = retryCount[photo.id] || 0;
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 mb-2">圖片加載失數</p>
        {retries < 3 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRetry(photo.id);
            }}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
          >
            重試
          </button>
        )}
      </div>
    );
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
        {availableCategories.map(category => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
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

      {isLoadingMore && photos.length === 0 ? (
        <div className="w-full h-40 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-[spin_2s_linear_infinite]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, index) => {
              const aspectRatio = photo.width / photo.height;
              const isPortrait = aspectRatio < 1;
              const isThumbnailLoaded = loadedThumbnails.has(photo.id);
              const hasFailed = failedThumbnails.has(photo.id);
              const isPriority = index < 6;
              
              // 使用更唯一的 key
              const uniqueKey = `${photo.id}-${index}`;
              
              return (
                <div
                  key={uniqueKey}
                  id={`photo-${photo.id}`}
                  className={`overflow-hidden rounded-lg shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105 ${
                    isPortrait ? 'sm:col-span-1 sm:row-span-2' : ''
                  }`}
                  style={{
                    opacity: 0,
                    touchAction: 'none' // 防止觸摸拖拽
                  }}
                  onClick={() => handlePhotoClick(photo)}
                >
                  <div 
                    className="relative w-full" 
                    style={{ 
                      aspectRatio: isPortrait ? '2/3' : '4/3',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none',
                      touchAction: 'pan-y' // 允許垂直滾動，但防止水平拖拽
                    }}
                  >
                    <div className={`absolute inset-0 bg-gray-100 transition-opacity duration-500 ${
                      isThumbnailLoaded ? 'opacity-0' : 'opacity-100'
                    }`} />
                    {hasFailed ? (
                      renderErrorThumbnail(photo)
                    ) : (
                      <CldImage
                        src={photo.publicId}
                        alt={photo.alt || photo.description || 'Photography portfolio image'}
                        fill
                        priority={isPriority}
                        className={`object-cover transition-all duration-500 ${
                          isPortrait ? 'scale-[1.15]' : ''
                        } ${
                          isThumbnailLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        crop="fill"
                        quality="auto"
                        format="auto"
                        loading={isPriority ? "eager" : "lazy"}
                        onLoad={() => {
                          handleThumbnailLoad(photo.id);
                          console.log('Thumbnail loaded:', photo.id);
                        }}
                        onError={(error) => {
                          console.error('Error loading thumbnail:', {
                            photoId: photo.id,
                            publicId: photo.publicId,
                            error: error,
                            timestamp: new Date().toISOString(),
                            isPriority
                          });
                          setFailedThumbnails(prev => new Set([...prev, photo.id]));
                        }}
                        style={{
                          touchAction: 'none',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          WebkitTouchCallout: 'none'
                        }}
                        fetchPriority={isPriority ? "high" : "low"}
                        placeholder="blur"
                        blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                          `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#f3f4f6"/></svg>`
                        ).toString('base64')}`}
                      />
                    )}
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

          {/* Loading indicator */}
          {hasMore && (
            <div 
              ref={observerTarget}
              className="w-full h-20 flex items-center justify-center"
            >
              {isLoadingMore && (
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-[spin_2s_linear_infinite]" />
              )}
            </div>
          )}
        </>
      )}

      {/* Fullscreen Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
          style={{ touchAction: 'none' }} // 防止觸摸拖拽
        >
          <div 
            className="relative w-full h-full flex items-center justify-center p-4"
            style={{ touchAction: 'none' }} // 防止觸摸拖拽
          >
            <button
              className="absolute top-8 right-8 text-gray-900 text-2xl hover:text-gray-600 transition-colors z-50"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>
            <div 
              className="relative w-full h-full max-w-7xl max-h-[calc(100vh-2rem)]"
              style={{ touchAction: 'none' }} // 防止觸摸拖拽
            >
              {isSpinnerVisible && (
                <div className={`absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 transition-opacity duration-300 ${
                  isLoading ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-[spin_2s_linear_infinite]" />
                </div>
              )}
              {failedThumbnails.has(selectedPhoto.id) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-lg text-gray-600 mb-4">無法載入圖片</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetry(selectedPhoto.id);
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                  >
                    重試
                  </button>
                </div>
              ) : (
                <CldImage
                  src={selectedPhoto.publicId}
                  alt={selectedPhoto.alt || selectedPhoto.description || 'Photography portfolio image'}
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
                  onError={(error) => {
                    console.error('Error loading full-size image:', {
                      photoId: selectedPhoto.id,
                      publicId: selectedPhoto.publicId,
                      error: error,
                      timestamp: new Date().toISOString()
                    });
                    setIsLoading(false);
                    setIsSpinnerVisible(false);
                    setFailedThumbnails(prev => new Set([...prev, selectedPhoto.id]));
                  }}
                  style={{
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none'
                  }}
                  fetchPriority="high"
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                    `<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="800" fill="#f3f4f6"/></svg>`
                  ).toString('base64')}`}
                />
              )}
              {selectedPhoto.description && !failedThumbnails.has(selectedPhoto.id) && (
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