import { Router } from 'express';
import Multer from 'multer';
import NodeID3 from 'node-id3';
import Sharp from 'sharp';
import ShortID from 'shortid';

import { getUID } from '../util/auth';
import { fileUpload } from '../util/storage';

const Upload = Multer({ storage: Multer.memoryStorage() });

const UploadRouter = Router();

UploadRouter.post('/', Upload.array('files'), async (req, res) => {
  if (!req.files) {
    return res.status(400).json({ status: 'error', message: 'empty file' });
  }
  const uid = await getUID(req.headers.authorization);

  if (!uid)
    return res
      .status(400)
      .json({ status: 'error', message: 'valid token required' });

  const fileProcesses = (req.files as Array<{
    buffer: Buffer;
    originalname: string;
  }>).map(async (file) => {
    const filename = ShortID();

    const tag = NodeID3.read(file.buffer);
    await fileUpload(`${uid}/${filename}.mp3`, file.buffer);

    if (tag.image) {
      const image = await Sharp(tag.image.imageBuffer)
        .resize(512, 512, { fit: 'contain' })
        .jpeg({ quality: 75 })
        .toBuffer();
      await fileUpload(`${uid}/${filename}.jpg`, image);
    }

    const { title, artist, performerInfo, album, image } = tag;

    return {
      title: title ?? file.originalname,
      artist: artist ?? '알 수 없는 아티스트',
      performerInfo,
      album: album ?? '알 수 없는 앨범',
      image,
    };
  });

  const result = await Promise.all(fileProcesses);

  return res.json({
    status: 'ok',
    ...result.map(({ image, ...rest }) => rest),
  });
});

export default UploadRouter;
