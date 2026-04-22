import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Inject q_auto,f_auto into a Cloudinary URL for optimal compression + modern formats.
 * No-op for non-Cloudinary URLs.
 */
export function optimizeCloudinary(url: string | null | undefined): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') && !url.includes('/image/upload/')) {
    return url;
  }
  if (url.includes('/upload/q_auto') || url.includes(',f_auto')) {
    return url;
  }
  return url.replace('/image/upload/', '/image/upload/q_auto,f_auto/');
}
