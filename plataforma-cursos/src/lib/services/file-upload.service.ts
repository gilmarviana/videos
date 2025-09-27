import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { LessonMaterial } from '../../types';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

export class FileUploadService {
  private uploadDir: string;
  private maxFileSize: number;
  private allowedMimeTypes: string[];

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.allowedMimeTypes = [
      'application/pdf',
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'audio/ogg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
  }

  async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  validateFile(file: UploadedFile): { isValid: boolean; error?: string } {
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`
      };
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `File type ${file.mimetype} is not allowed. Allowed types: PDF, Audio files, Word documents, Text files`
      };
    }

    return { isValid: true };
  }

  async saveFile(file: UploadedFile): Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
  }> {
    try {
      await this.ensureUploadDirectory();

      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(this.uploadDir, fileName);

      if (file.buffer) {
        await fs.writeFile(filePath, file.buffer);
      } else if (file.path) {
        await fs.copyFile(file.path, filePath);
        // Clean up temporary file
        await fs.unlink(file.path);
      } else {
        return { success: false, error: 'No file data provided' };
      }

      return {
        success: true,
        filePath: `/uploads/${fileName}`
      };
    } catch (error) {
      console.error('Error saving file:', error);
      return { success: false, error: 'Failed to save file' };
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  createLessonMaterial(file: UploadedFile, filePath: string): LessonMaterial {
    const materialType = this.getMaterialType(file.mimetype);
    
    return {
      id: uuidv4(),
      name: file.originalname,
      type: materialType,
      url: filePath,
      size: file.size
    };
  }

  private getMaterialType(mimetype: string): 'pdf' | 'audio' | 'document' {
    if (mimetype === 'application/pdf') {
      return 'pdf';
    }
    
    if (mimetype.startsWith('audio/')) {
      return 'audio';
    }
    
    return 'document';
  }

  async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    mimeType?: string;
    error?: string;
  }> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      const stats = await fs.stat(fullPath);
      
      if (!stats.isFile()) {
        return { exists: false, error: 'Path is not a file' };
      }

      // Simple mime type detection based on extension
      const extension = path.extname(filePath).toLowerCase();
      const mimeTypeMap: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain'
      };

      return {
        exists: true,
        size: stats.size,
        mimeType: mimeTypeMap[extension] || 'application/octet-stream'
      };
    } catch (error) {
      return { exists: false, error: 'File not found or inaccessible' };
    }
  }

  async cleanupOrphanedFiles(activeMaterials: LessonMaterial[]): Promise<{
    cleaned: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let cleaned = 0;

    try {
      await this.ensureUploadDirectory();
      const files = await fs.readdir(this.uploadDir);
      const activeFiles = new Set(activeMaterials.map(m => path.basename(m.url)));

      for (const file of files) {
        if (!activeFiles.has(file)) {
          try {
            await fs.unlink(path.join(this.uploadDir, file));
            cleaned++;
          } catch (error) {
            errors.push(`Failed to delete ${file}: ${error}`);
          }
        }
      }
    } catch (error) {
      errors.push(`Failed to read upload directory: ${error}`);
    }

    return { cleaned, errors };
  }

  getUploadConfig() {
    return {
      maxFileSize: this.maxFileSize,
      allowedMimeTypes: this.allowedMimeTypes,
      uploadDir: this.uploadDir
    };
  }
}

export const fileUploadService = new FileUploadService();