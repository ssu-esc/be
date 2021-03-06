import { Storage, CopyResponse, MoveResponse } from '@google-cloud/storage';
import Logger from './logger';

const storage = new Storage();
const bucket = storage.bucket('storage.musicplayer.cloud');

export function upload(name: string, buffer: Buffer): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const stream = bucket.file(name).createWriteStream({
      resumable: false,
    });
    stream.on('finish', () => {
      resolve(true);
    });
    stream.on('error', () => {
      Logger.error(`'${name}' upload failed`, { label: 'Storage' });
      reject();
    });
    stream.end(buffer);
  });
}

export function remove(name: string): Promise<any> {
  return bucket.file(name).delete();
}

export function move(from: string, to: string): Promise<MoveResponse> {
  return bucket.file(from).move(to);
}

export function copy(from: string, to: string): Promise<CopyResponse> {
  return bucket.file(from).copy(to);
}
