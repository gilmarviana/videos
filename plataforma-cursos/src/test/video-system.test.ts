import { describe, it, expect, beforeEach, vi } from 'vitest';
import { videoService } from '../lib/services/video.service';
import { progressService } from '../lib/services/progress.service';

// Mock fetch for testing
global.fetch = vi.fn();

describe('Video System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Video Service', () => {
    describe('validateVideoUrl', () => {
      it('should validate Google Drive URLs correctly', async () => {
        const validGoogleDriveUrl = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view';
        
        const result = await videoService.validateVideoUrl(validGoogleDriveUrl, 'google_drive');
        
        expect(result.isValid).toBe(true);
        expect(result.metadata).toBeDefined();
        expect(result.streamUrl).toBeDefined();
      });

      it('should reject invalid Google Drive URLs', async () => {
        const invalidUrl = 'https://invalid-url.com/file';
        
        const result = await videoService.validateVideoUrl(invalidUrl, 'google_drive');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid Google Drive URL format');
      });

      it('should validate OneDrive URLs correctly', async () => {
        const validOneDriveUrl = 'https://1drv.ms/v/s!AhKAe3z7QjCKgQEAaYOqOvUgQ1uC';
        
        const result = await videoService.validateVideoUrl(validOneDriveUrl, 'onedrive');
        
        expect(result.isValid).toBe(true);
        expect(result.metadata).toBeDefined();
      });

      it('should validate direct video URLs correctly', async () => {
        const validDirectUrl = 'https://example.com/video.mp4';
        
        // Mock successful HEAD request
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          headers: {
            get: (header: string) => {
              if (header === 'content-length') return '1000000';
              if (header === 'content-type') return 'video/mp4';
              return null;
            }
          }
        });
        
        const result = await videoService.validateVideoUrl(validDirectUrl, 'direct');
        
        expect(result.isValid).toBe(true);
        expect(result.metadata?.format).toBe('mp4');
      });

      it('should reject direct URLs without video extensions', async () => {
        const invalidUrl = 'https://example.com/document.pdf';
        
        const result = await videoService.validateVideoUrl(invalidUrl, 'direct');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('does not point to a supported video format');
      });

      it('should handle invalid video sources', async () => {
        const url = 'https://example.com/video.mp4';
        
        const result = await videoService.validateVideoUrl(url, 'invalid_source' as any);
        
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid video source');
      });
    });

    describe('getSupportedFormats', () => {
      it('should return list of supported video formats', () => {
        const formats = videoService.getSupportedFormats();
        
        expect(formats).toContain('mp4');
        expect(formats).toContain('avi');
        expect(formats).toContain('mov');
        expect(formats).toContain('webm');
      });
    });

    describe('getSupportedSources', () => {
      it('should return list of supported video sources', () => {
        const sources = videoService.getSupportedSources();
        
        expect(sources).toContain('google_drive');
        expect(sources).toContain('onedrive');
        expect(sources).toContain('direct');
      });
    });

    describe('getStreamableUrl', () => {
      it('should generate streamable URL for Google Drive videos', async () => {
        const video = {
          id: 'test-id',
          lessonId: 'lesson-1',
          url: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
          source: 'google_drive' as const,
          format: 'mp4' as const,
          durationSeconds: 300,
          metadata: { format: 'mp4', durationSeconds: 300, size: 1000000, resolution: '1080p' },
          isProcessed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const streamUrl = await videoService.getStreamableUrl(video);
        
        expect(streamUrl).toContain('drive.google.com/uc?export=download');
      });

      it('should return direct URL for direct videos', async () => {
        const video = {
          id: 'test-id',
          lessonId: 'lesson-1',
          url: 'https://example.com/video.mp4',
          source: 'direct' as const,
          format: 'mp4' as const,
          durationSeconds: 300,
          metadata: { format: 'mp4', durationSeconds: 300, size: 1000000, resolution: '1080p' },
          isProcessed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const streamUrl = await videoService.getStreamableUrl(video);
        
        expect(streamUrl).toBe(video.url);
      });
    });
  });

  describe('Progress Service', () => {
    describe('calculateProgressPercentage', () => {
      it('should calculate progress percentage correctly', () => {
        const percentage = progressService.calculateProgressPercentage(150, 300);
        expect(percentage).toBe(50);
      });

      it('should handle zero duration', () => {
        const percentage = progressService.calculateProgressPercentage(150, 0);
        expect(percentage).toBe(0);
      });

      it('should cap at 100%', () => {
        const percentage = progressService.calculateProgressPercentage(400, 300);
        expect(percentage).toBe(100);
      });
    });

    describe('isLessonCompleted', () => {
      it('should consider lesson completed at 90% threshold', () => {
        const isCompleted = progressService.isLessonCompleted(270, 300, 0.9);
        expect(isCompleted).toBe(true);
      });

      it('should not consider lesson completed below threshold', () => {
        const isCompleted = progressService.isLessonCompleted(250, 300, 0.9);
        expect(isCompleted).toBe(false);
      });

      it('should handle zero duration', () => {
        const isCompleted = progressService.isLessonCompleted(100, 0);
        expect(isCompleted).toBe(false);
      });
    });

    describe('getResumeTime', () => {
      it('should return watched seconds for incomplete progress', () => {
        const progress = {
          id: 'progress-1',
          userId: 'user-1',
          lessonId: 'lesson-1',
          watchedSeconds: 150,
          completed: false,
          lastWatchedAt: new Date()
        };
        
        const resumeTime = progressService.getResumeTime(progress);
        expect(resumeTime).toBe(150);
      });

      it('should return 0 for completed progress', () => {
        const progress = {
          id: 'progress-1',
          userId: 'user-1',
          lessonId: 'lesson-1',
          watchedSeconds: 300,
          completed: true,
          lastWatchedAt: new Date(),
          completedAt: new Date()
        };
        
        const resumeTime = progressService.getResumeTime(progress);
        expect(resumeTime).toBe(0);
      });

      it('should return 0 for null progress', () => {
        const resumeTime = progressService.getResumeTime(null);
        expect(resumeTime).toBe(0);
      });
    });

    describe('saveProgress', () => {
      it('should save progress via API call', async () => {
        const mockResponse = {
          success: true,
          data: {
            id: 'progress-1',
            userId: 'user-1',
            lessonId: 'lesson-1',
            watchedSeconds: 150,
            completed: false,
            lastWatchedAt: new Date()
          }
        };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });

        const result = await progressService.saveProgress('user-1', 'lesson-1', 150, 300);
        
        expect(result).toEqual(mockResponse.data);
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/lessons/lesson-1/progress',
          expect.objectContaining({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: 'user-1',
              watchedSeconds: 150,
              completed: false
            })
          })
        );
      });

      it('should handle API errors', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 500
        });

        await expect(
          progressService.saveProgress('user-1', 'lesson-1', 150, 300)
        ).rejects.toThrow('Failed to save progress');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete video workflow', async () => {
      // 1. Validate video URL
      const videoUrl = 'https://example.com/video.mp4';
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (header: string) => {
            if (header === 'content-length') return '5000000';
            if (header === 'content-type') return 'video/mp4';
            return null;
          }
        }
      });
      
      const validation = await videoService.validateVideoUrl(videoUrl, 'direct');
      expect(validation.isValid).toBe(true);

      // 2. Save progress
      const mockProgressResponse = {
        success: true,
        data: {
          id: 'progress-1',
          userId: 'user-1',
          lessonId: 'lesson-1',
          watchedSeconds: 150,
          completed: false,
          lastWatchedAt: new Date()
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProgressResponse)
      });

      const progress = await progressService.saveProgress('user-1', 'lesson-1', 150, 300);
      expect(progress.watchedSeconds).toBe(150);

      // 3. Check completion status
      const isCompleted = progressService.isLessonCompleted(150, 300);
      expect(isCompleted).toBe(false);

      // 4. Calculate progress percentage
      const percentage = progressService.calculateProgressPercentage(150, 300);
      expect(percentage).toBe(50);
    });
  });
});