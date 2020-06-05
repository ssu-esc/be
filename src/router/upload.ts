import { Router } from 'express';
import Multer from 'multer';
import NodeID3 from 'node-id3';
import Sharp from 'sharp';
import ShortID from 'shortid';

import { fileUpload } from '../util/storage';
import Album from '../db/models/album';
import Track from '../db/models/track';

const Upload = Multer({ storage: Multer.memoryStorage() });

const UploadRouter = Router();

UploadRouter.post('/', Upload.array('files'), async (req: AuthRequest, res) => {
  if (!req.files) {
    return res.status(400).json({ status: 'error', message: 'empty file' });
  }

  const uid = req.user?.sub ?? null;

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

    const trackProps = {
      trackId: filename,
      coverId: tag.image ? filename : null,
      title: tag.title ?? file.originalname,
      artist: tag.artist ?? '알 수 없는 아티스트',
      trackNumber: 0,
    };

    const albumProps = {
      title: tag.album ?? '알 수 없는 앨범',
      artist: tag.performerInfo ?? trackProps.artist,
      uid,
    };

    const album: Array<Album> = await Album.findOrCreate({
      where: albumProps,
    });

    const track: Track = await Track.create(trackProps);

    await album[0].addTrack(track);

    return trackProps;
  });

  const result = await Promise.all(fileProcesses);

  return res.json({
    status: 'ok',
    ...result,
  });
});

export default UploadRouter;
