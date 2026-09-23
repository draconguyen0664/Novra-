export type UploadResult = { url: string; width?: number; height?: number };

export interface StorageAdapter {
  upload(file: File, path: string): Promise<UploadResult>;
  remove(url: string): Promise<void>;
}

export function getStorageAdapter(): StorageAdapter {
  throw new Error('No upload provider configured. Set up a StorageAdapter before enabling CMS uploads.');
}
