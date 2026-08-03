import { customFetch } from '@workspace/api-client-react';

export async function uploadProfileImage(file: File, folder: 'teachers' | 'students') {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (file.size > 4 * 1024 * 1024) throw new Error('Choose an image smaller than 4 MB.');
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
  const result = await customFetch<{ url: string }>('/api/admin/upload-image', {
    method: 'POST', responseType: 'json', body: JSON.stringify({ data, filename: file.name, contentType: file.type, folder }),
  });
  return result.url;
}
