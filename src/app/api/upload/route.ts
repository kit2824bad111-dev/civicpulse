import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/middleware-auth';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '6mb',
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const authRes = await authorizeRequest(req);
    if ('status' in authRes) return authRes;

    const body = await req.json();
    const { fileData, fileName, fileType } = body;

    if (!fileData) {
      return NextResponse.json({ error: 'No file data provided.' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (fileType && !validTypes.includes(fileType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WEBP images are allowed.' },
        { status: 400 }
      );
    }

    // Estimate file size from base64 length
    const approxSizeInBytes = Math.round((fileData.length * 3) / 4);
    if (approxSizeInBytes > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit of 5MB.' },
        { status: 400 }
      );
    }

    // Standardized data URL response for demonstration and local persistence
    let fileUrl = fileData;
    if (!fileData.startsWith('data:')) {
      fileUrl = `data:${fileType || 'image/jpeg'};base64,${fileData}`;
    }

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: fileName || 'complaint_photo.jpg',
    });
  } catch (error: any) {
    console.error('Error handling upload:', error);
    return NextResponse.json({ error: 'Failed to upload photo.' }, { status: 500 });
  }
}
