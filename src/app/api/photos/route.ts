import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Photo } from '@/app/types/photo';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || 'all';
    
    console.log('Fetching photos with params:', {
      page,
      limit,
      category,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    });

    // Get all resources from Cloudinary
    const result = await cloudinary.search
      .expression('folder:portfolio/*')
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();

    console.log('Cloudinary search result:', {
      totalCount: result.total_count,
      resources: result.resources?.length || 0
    });

    if (!result.resources) {
      console.error('No resources found in Cloudinary response');
      return NextResponse.json({ error: 'No photos found' }, { status: 404 });
    }

    // Transform Cloudinary resources to Photo objects
    const allPhotos: Photo[] = result.resources.map((resource: any) => {
      // 從 public_id 生成有意義的 alt 文本
      const altText = resource.context?.custom?.description || 
        resource.public_id.split('/').pop()?.replace(/-/g, ' ') || 
        'Photography portfolio image';

      // 從 public_id 獲取類別
      const pathParts = resource.public_id.split('/');
      const folderCategory = pathParts.length > 1 ? pathParts[1] : 'uncategorized';
      
      // 優先使用自定義類別，如果沒有則使用文件夾名稱
      const category = resource.context?.custom?.category || folderCategory;

      return {
        id: resource.public_id,
        publicId: resource.public_id,
        url: resource.secure_url,
        width: resource.width,
        height: resource.height,
        description: resource.context?.custom?.description || '',
        category: category.toLowerCase(),
        alt: altText
      };
    });

    // 移除重複的照片（基於 publicId）
    const uniquePhotos = Array.from(
      new Map(allPhotos.map(photo => [photo.publicId, photo])).values()
    );

    // 獲取所有可用的類別
    const allCategories = [...new Set(uniquePhotos
      .map(photo => photo.category)
      .filter(category => 
        category !== undefined && 
        category.toLowerCase() !== 'thumbnail' &&
        category.toLowerCase() !== 'uncategorized'
      ))];

    // Filter by category if not 'all'
    const filteredPhotos = category === 'all' 
      ? uniquePhotos 
      : uniquePhotos.filter(photo => photo.category === category.toLowerCase());

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPhotos = filteredPhotos.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredPhotos.length;

    console.log('Returning paginated photos:', {
      total: filteredPhotos.length,
      page,
      limit,
      returned: paginatedPhotos.length,
      hasMore,
      categories: allCategories
    });

    return NextResponse.json({
      photos: paginatedPhotos,
      hasMore,
      total: filteredPhotos.length,
      categories: allCategories
    }, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'ETag': `"${Buffer.from(JSON.stringify(paginatedPhotos)).toString('base64').slice(0, 32)}"`,
        'Vary': 'Accept-Encoding, Accept-Language'
      }
    });
  } catch (error) {
    console.error('Error in photos API route:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
  }
} 