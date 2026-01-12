import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

const MAX_SIZE_IN_BYTES = 10 * 1024 * 1024;
const CACHE_CONTROL_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jsonResponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        maximumSizeInBytes: MAX_SIZE_IN_BYTES,
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        addRandomSuffix: true,
        allowOverwrite: false,
        cacheControlMaxAge: CACHE_CONTROL_MAX_AGE,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log(`Upload completed: ${blob.url}`);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
