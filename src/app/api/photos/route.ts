import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfig } from '@/app/config/cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudinaryConfig.cloudName,
  api_key: cloudinaryConfig.apiKey,
  api_secret: cloudinaryConfig.apiSecret,
});

export async function GET() {
  try {
    // Get all resources from the portfolio folder
    const result = await cloudinary.search
      .expression('folder:portfolio/*')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    // Transform the results to match our Photo interface
    const photos = result.resources.map((resource: any) => ({
      id: resource.public_id,
      publicId: resource.public_id,
      alt: resource.public_id.split('/').pop()?.replace(/-/g, ' ') || '',
      category: resource.public_id.split('/')[1] || 'uncategorized',
      description: resource.context?.description || '',
      width: resource.width,
      height: resource.height,
      format: resource.format,
      url: resource.secure_url,
    }));

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
} 