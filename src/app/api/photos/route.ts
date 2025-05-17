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

    // Build the search expression based on whether a specific folder is requested
    const expression = folder 
      ? `folder:portfolio/${folder}/*`
      : 'folder:portfolio/*';

    // Get all resources from the specified folder
    const result = await cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    console.log('Raw Cloudinary response:', JSON.stringify(result, null, 2));

    // Transform the results to match our Photo interface
    const photos = result.resources.map((resource: CloudinaryResource) => {
      // Get the subfolder name from the public_id
      const pathParts = resource.public_id.split('/');
      const folder = pathParts.length > 1 ? pathParts[1] : 'uncategorized';
      
      // 保持原始 public_id 不變，因為這是 Cloudinary 的實際路徑
      const publicId = resource.public_id;
      
      console.log('Photo details:', {
        public_id: resource.public_id,
        folder: folder,
        pathParts: pathParts
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

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
} 