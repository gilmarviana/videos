import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Time utilities
export const timeUtils = {
  minutesToHours: (minutes: number): number => {
    return Math.floor(minutes / 60);
  },

  minutesToHoursAndMinutes: (minutes: number): { hours: number; minutes: number } => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return { hours, minutes: remainingMinutes };
  },

  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  formatTimeRemaining: (minutes: number): string => {
    if (minutes <= 0) return '0 minutos';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${remainingMinutes} minutos`;
  }
};

// Currency utilities
export const currencyUtils = {
  formatBRL: (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  },

  parseBRL: (value: string): number => {
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
  }
};

// Validation utilities
export const validationUtils = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword: (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

// String utilities
export const stringUtils = {
  slugify: (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  },

  truncate: (text: string, length: number): string => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  },

  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
};

// Date utilities
export const dateUtils = {
  formatDate: (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  },

  formatDateTime: (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  isExpired: (date: Date): boolean => {
    return date < new Date();
  },

  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  addHours: (date: Date, hours: number): Date => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }
};

// File utilities
export const fileUtils = {
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileExtension: (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  isVideoFile: (filename: string): boolean => {
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'ts', 'webm'];
    const extension = fileUtils.getFileExtension(filename).toLowerCase();
    return videoExtensions.includes(extension);
  },

  isPdfFile: (filename: string): boolean => {
    return fileUtils.getFileExtension(filename).toLowerCase() === 'pdf';
  },

  isAudioFile: (filename: string): boolean => {
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
    const extension = fileUtils.getFileExtension(filename).toLowerCase();
    return audioExtensions.includes(extension);
  }
};

// Error handling utilities
export const errorUtils = {
  getErrorMessage: (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unknown error occurred';
  },

  isNetworkError: (error: unknown): boolean => {
    return error instanceof Error && (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('connection')
    );
  }
};