import path from 'path';
import fs from 'fs';
import { env } from '../../config/env';

export interface StorageResult {
  storageKey: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface IStorageService {
  saveFile(file: Express.Multer.File): Promise<StorageResult>;
  getFileUrl(storageKey: string): string;
  deleteFile(storageKey: string): Promise<boolean>;
  getFileBuffer(storageKey: string): Promise<Buffer>;
}

class LocalStorageService implements IStorageService {
  private uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<StorageResult> {
    const storageKey = file.filename;
    const url = `/uploads/${storageKey}`;
    return {
      storageKey,
      url,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  getFileUrl(storageKey: string): string {
    if (storageKey.startsWith('http://') || storageKey.startsWith('https://')) {
      return storageKey;
    }
    return `/uploads/${storageKey}`;
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, storageKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      return true;
    } catch (err) {
      console.error('Error deleting file:', err);
      return false;
    }
  }

  async getFileBuffer(storageKey: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, storageKey);
    return fs.promises.readFile(filePath);
  }
}

// In production, Cloudinary or S3 adapter can be instantiated here
export const storageService: IStorageService = new LocalStorageService();
