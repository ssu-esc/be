import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucket = storage.bucket('storage.musicplayer.cloud');

export function fileUpload(name: string, buffer: Buffer): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const stream = bucket.file(name).createWriteStream({
      resumable: false,
    });
    stream.on('finish', () => {
      resolve(true);
    });
    stream.on('error', reject);
    stream.end(buffer);
  });
}

export default {
  fileUpload,
};
