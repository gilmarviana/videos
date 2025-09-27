import { Video, VideoMetadata, VideoValidationResult } from '../../types';

export class VideoService {
  /**
   * Validate video URL based on source type
   */
  async validateVideoUrl(url: string, source: 'google_drive' | 'onedrive' | 'direct'): Promise<VideoValidationResult> {
    try {
      switch (source) {
        case 'google_drive':
          return await this.validateGoogleDriveUrl(url);
        case 'onedrive':
          return await this.validateOneDriveUrl(url);
        case 'direct':
          return await this.validateDirectVideoUrl(url);
        default:
          return { 
            isValid: false, 
            error: 'Invalid video source. Must be one of: google_drive, onedrive, direct' 
          };
      }
    } catch (error) {
      console.error('Video validation error:', error);
      return { 
        isValid: false, 
        error: 'Failed to validate video URL' 
      };
    }
  }

  /**
   * Validate Google Drive video URL
   */
  private async validateGoogleDriveUrl(url: string): Promise<VideoValidationResult> {
    // Google Drive URL patterns:
    // https://drive.google.com/file/d/{fileId}/view
    // https://drive.google.com/open?id={fileId}
    // https://docs.google.com/file/d/{fileId}/edit
    
    const patterns = [
      /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
      /^https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
      /^https:\/\/docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
    ];

    let fileId: string | null = null;
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        fileId = match[1];
        break;
      }
    }

    if (!fileId) {
      return { 
        isValid: false, 
        error: 'Invalid Google Drive URL format. Please use a valid Google Drive share link.' 
      };
    }

    try {
      // Extract metadata from Google Drive
      const metadata = await this.extractGoogleDriveMetadata(fileId);
      
      return {
        isValid: true,
        metadata,
        streamUrl: this.generateGoogleDriveStreamUrl(fileId)
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Unable to access Google Drive file. Please ensure the file is publicly accessible or shared properly.' 
      };
    }
  }

  /**
   * Validate OneDrive video URL
   */
  private async validateOneDriveUrl(url: string): Promise<VideoValidationResult> {
    // OneDrive URL patterns:
    // https://1drv.ms/{shortId}
    // https://{tenant}.sharepoint.com/personal/{user}/_layouts/15/onedrive.aspx?id={path}
    // https://{tenant}-my.sharepoint.com/personal/{user}/Documents/{path}
    
    const patterns = [
      /^https:\/\/1drv\.ms\/[a-zA-Z]\/[a-zA-Z0-9_-]+/,
      /^https:\/\/[^\/]+\.sharepoint\.com/,
      /^https:\/\/[^\/]+-my\.sharepoint\.com/
    ];

    const isValidPattern = patterns.some(pattern => pattern.test(url));
    
    if (!isValidPattern) {
      return { 
        isValid: false, 
        error: 'Invalid OneDrive URL format. Please use a valid OneDrive share link.' 
      };
    }

    try {
      // Extract metadata from OneDrive
      const metadata = await this.extractOneDriveMetadata(url);
      
      return {
        isValid: true,
        metadata,
        streamUrl: await this.generateOneDriveStreamUrl(url)
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Unable to access OneDrive file. Please ensure the file is publicly accessible or shared properly.' 
      };
    }
  }

  /**
   * Validate direct video URL
   */
  private async validateDirectVideoUrl(url: string): Promise<VideoValidationResult> {
    try {
      // Validate URL format
      const urlObj = new URL(url);
      
      // Check if URL ends with a video extension
      const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'ts', 'webm', 'm4v', 'flv', 'wmv'];
      const pathname = urlObj.pathname.toLowerCase();
      const extension = pathname.split('.').pop();
      
      if (!extension || !videoExtensions.includes(extension)) {
        return { 
          isValid: false, 
          error: `URL does not point to a supported video format. Supported formats: ${videoExtensions.join(', ')}` 
        };
      }

      try {
        // Try to fetch video metadata
        const metadata = await this.extractDirectVideoMetadata(url);
        
        return {
          isValid: true,
          metadata,
          streamUrl: url
        };
      } catch (error) {
        // If metadata extraction fails, still consider valid if URL format is correct
        return {
          isValid: true,
          metadata: {
            format: extension,
            durationSeconds: 0,
            size: 0,
            resolution: 'unknown'
          },
          streamUrl: url
        };
      }
    } catch {
      return { 
        isValid: false, 
        error: 'Invalid URL format' 
      };
    }
  }

  /**
   * Extract metadata from Google Drive file
   */
  private async extractGoogleDriveMetadata(fileId: string): Promise<VideoMetadata> {
    // In a real implementation, you would use Google Drive API
    // For now, we'll return default metadata
    return {
      format: 'mp4',
      durationSeconds: 0,
      size: 0,
      resolution: 'unknown',
      bitrate: 0
    };
  }

  /**
   * Extract metadata from OneDrive file
   */
  private async extractOneDriveMetadata(url: string): Promise<VideoMetadata> {
    // In a real implementation, you would use Microsoft Graph API
    // For now, we'll return default metadata
    return {
      format: 'mp4',
      durationSeconds: 0,
      size: 0,
      resolution: 'unknown',
      bitrate: 0
    };
  }

  /**
   * Extract metadata from direct video URL
   */
  private async extractDirectVideoMetadata(url: string): Promise<VideoMetadata> {
    try {
      // Try to get basic info from HEAD request
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        throw new Error('Unable to access video file');
      }

      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      
      const pathname = new URL(url).pathname.toLowerCase();
      const extension = pathname.split('.').pop() || 'mp4';

      return {
        format: extension,
        durationSeconds: 0, // Would need video processing library to extract
        size: contentLength ? parseInt(contentLength) : 0,
        resolution: 'unknown',
        bitrate: 0
      };
    } catch (error) {
      throw new Error('Unable to extract video metadata');
    }
  }

  /**
   * Generate Google Drive stream URL
   */
  private generateGoogleDriveStreamUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  /**
   * Generate OneDrive stream URL
   */
  private async generateOneDriveStreamUrl(url: string): Promise<string> {
    // For OneDrive, we need to convert share URL to direct download URL
    // This is a simplified implementation
    if (url.includes('1drv.ms')) {
      // For 1drv.ms links, we'd need to resolve the redirect
      return url.replace('1drv.ms', '1drv.ms/download');
    }
    
    // For SharePoint URLs, append download parameter
    const urlObj = new URL(url);
    urlObj.searchParams.set('download', '1');
    return urlObj.toString();
  }

  /**
   * Get supported video formats
   */
  getSupportedFormats(): string[] {
    return ['mp4', 'avi', 'mov', 'mkv', 'ts', 'webm', 'm4v', 'flv', 'wmv'];
  }

  /**
   * Get supported video sources
   */
  getSupportedSources(): string[] {
    return ['google_drive', 'onedrive', 'direct'];
  }

  /**
   * Convert video URL to streamable format
   */
  async getStreamableUrl(video: Video): Promise<string> {
    switch (video.source) {
      case 'google_drive':
        return this.generateGoogleDriveStreamUrl(this.extractGoogleDriveFileId(video.url));
      case 'onedrive':
        return await this.generateOneDriveStreamUrl(video.url);
      case 'direct':
        return video.url;
      default:
        throw new Error('Unsupported video source');
    }
  }

  /**
   * Extract Google Drive file ID from URL
   */
  private extractGoogleDriveFileId(url: string): string {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    throw new Error('Unable to extract Google Drive file ID');
  }
}

export const videoService = new VideoService();