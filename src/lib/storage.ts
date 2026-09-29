import 'server-only';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type UploadResult = { url: string; width?: number; height?: number };

export interface StorageAdapter {
  upload(file: File, targetName: string): Promise<UploadResult>;
  remove(url: string): Promise<void>;
}

class LocalStorageAdapter implements StorageAdapter {
  private root = path.join(process.cwd(), 'public', 'uploads');

  async upload(file: File, targetName: string) {
    await mkdir(this.root, { recursive: true });
    await writeFile(path.join(this.root, targetName), Buffer.from(await file.arrayBuffer()));
    return { url: '/uploads/' + targetName };
  }

  async remove(url: string) {
    if (!url.startsWith('/uploads/')) return;
    const filename = path.basename(url);
    await unlink(path.join(this.root, filename)).catch(() => undefined);
  }
}

export function getStorageAdapter(): StorageAdapter {
  return new LocalStorageAdapter();
}