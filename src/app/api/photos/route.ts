import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfig } from '@/app/config/cloudinary';

interface CloudinaryResource {
  public_id: string;
  width: number;
  height: number;
  format: string;
  secure_url: string;
  context?: {
    description?: string;
  };
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudinaryConfig.cloudName,
  api_key: cloudinaryConfig.apiKey,
  api_secret: cloudinaryConfig.apiSecret,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    
    console.log('Processing photo request:', {
      folder,
      timestamp: new Date().toISOString(),
      cloudName: cloudinaryConfig.cloudName
    });

    // Build the search expression based on whether a specific folder is requested
    const expression = folder 
      ? `folder:portfolio/${folder}/*`
      : 'folder:portfolio/*';

    console.log('Cloudinary search expression:', expression);

    // Get all resources from the specified folder
    const result = await cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    console.log('Cloudinary API response:', {
      resourceCount: result.resources.length,
      firstResource: result.resources[0] ? {
        public_id: result.resources[0].public_id,
        secure_url: result.resources[0].secure_url
      } : null,
      timestamp: new Date().toISOString()
    });

    // Transform the results to match our Photo interface
    const photos = result.resources.map((resource: CloudinaryResource) => {
      // Get the subfolder name from the public_id
      const pathParts = resource.public_id.split('/');
      const folder = pathParts.length > 1 ? pathParts[1] : 'uncategorized';
      
      // 保持原始 public_id 不變，因為這是 Cloudinary 的實際路徑
      const publicId = resource.public_id;
      
      console.log('Processing photo:', {
        public_id: resource.public_id,
        folder: folder,
        pathParts: pathParts,
        secure_url: resource.secure_url
      });
      
      return {
        id: publicId,
        publicId: publicId,
        alt: resource.public_id.split('/').pop()?.replace(/-/g, ' ') || '',
        category: folder,
        description: resource.context?.description || '',
        width: resource.width,
        height: resource.height,
        format: resource.format,
        url: resource.secure_url,
      };
    });

    return new NextResponse(
      JSON.stringify({ photos }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60', // 減少快取時間並添加 stale-while-revalidate
        },
      }
    );
  } catch (error) {
    console.error('Error in photos API:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch photos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 