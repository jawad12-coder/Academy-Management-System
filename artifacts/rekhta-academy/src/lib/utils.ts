import { twMerge } from 'tailwind-merge';

import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isFacebookThumbnail(url: string | null | undefined): boolean {
  return typeof url === 'string' && /rekhta-facebook-archive/i.test(url);
}

export function resolveTeacherPhoto(
  fullName: string,
  photoUrl: string | null | undefined,
  localPhotos: Record<string, string>,
): string {
  const local = localPhotos[fullName.trim().toLowerCase()];
  if (photoUrl && !isFacebookThumbnail(photoUrl)) return photoUrl;
  return local || photoUrl || '';
}
