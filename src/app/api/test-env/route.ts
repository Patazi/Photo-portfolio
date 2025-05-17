import { NextResponse } from 'next/server';

export async function GET() {
  // 檢查必要的環境變量是否存在
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  const missingVars = [];
  if (!cloudName) missingVars.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
  if (!apiKey) missingVars.push('CLOUDINARY_API_KEY');
  if (!apiSecret) missingVars.push('CLOUDINARY_API_SECRET');
  if (!uploadPreset) missingVars.push('CLOUDINARY_UPLOAD_PRESET');

  if (missingVars.length > 0) {
    return NextResponse.json({
      status: 'error',
      message: 'Missing environment variables',
      missing: missingVars
    }, { status: 500 });
  }

  // 檢查 Cloudinary 配置是否有效
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/list?max_results=1`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Cloudinary API test failed');
    }

    return NextResponse.json({
      status: 'success',
      message: 'Environment variables are correctly configured',
      cloudName: cloudName,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      uploadPreset: uploadPreset
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Cloudinary configuration test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 