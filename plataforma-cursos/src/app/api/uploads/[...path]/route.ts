import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { fileUploadService } from '../../../../lib/services/file-upload.service';

// GET /api/uploads/[...path] - Serve uploaded files
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // TODO: Add authentication middleware to verify user has access to the file
    
    const filePath = params.path.join('/');
    const fullPath = path.join(process.cwd(), 'uploads', filePath);

    // Security check: ensure the path is within the uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const resolvedPath = path.resolve(fullPath);
    const resolvedUploadsDir = path.resolve(uploadsDir);

    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if file exists
    const fileInfo = await fileUploadService.getFileInfo(`/uploads/${filePath}`);
    if (!fileInfo.exists) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read and serve the file
    const fileBuffer = await fs.readFile(fullPath);
    
    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', fileInfo.mimeType || 'application/octet-stream');
    headers.set('Content-Length', fileInfo.size?.toString() || '0');
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Set Content-Disposition for downloads
    const filename = path.basename(filePath);
    headers.set('Content-Disposition', `inline; filename="${filename}"`);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error serving file:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}