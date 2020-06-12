import { Router } from 'express';
import Multer from 'multer';
import NodeID3 from 'node-id3';
import Sharp from 'sharp';
import ShortID from 'shortid';

import { upload } from '../util/storage';
import Album from '../db/models/album';
import Track from '../db/models/track';
import { getUser } from '../util/auth';
import { getTrackNumber } from '../util/tag';
import { AuthRequest } from '../types';

const Upload = Multer({ storage: Multer.memoryStorage() });

const UploadRouter = Router();

UploadRouter.post('/', Upload.array('files'), async (req: AuthRequest, res) => {
  if (!req.files) {
    return res.status(400).json({ status: 'error', message: 'empty file' });
  }

  const uid = getUser(req);

  if (!uid)
    return res
      .status(400)
      .json({ status: 'error', message: 'valid token required' });

  const fileProcesses = (req.files as Array<Express.Multer.File>).map(
    async (file) => {
      const filename = ShortID();
      const tag = NodeID3.read(file.buffer);
      const trackProps = {
        trackId: filename,
        title: tag.title ?? file.originalname,
        artist: tag.artist ?? '알 수 없는 아티스트',
        trackNumber: getTrackNumber(tag.trackNumber),
      };
      const albumProps = {
        title: tag.album ?? '알 수 없는 앨범',
        artist: tag.performerInfo ?? trackProps.artist,
        uid,
      };

      try {
        await upload(`${uid}/${filename}.mp3`, file.buffer);
        const album: Album = (
          await Album.findOrCreate({
            where: albumProps,
          })
        )[0];
        const track: Track = await Track.create(trackProps);
        await album.addTrack(track);
        if (tag.image && !album.hasCover) {
          const image = await Sharp(tag.image.imageBuffer)
            .resize(512, 512, { fit: 'contain' })
            .jpeg({ quality: 75 })
            .toBuffer();
          await upload(`${uid}/${album.albumId}.jpg`, image);
          await album.update({ hasCover: true });
        }

        return { status: 'ok', ...trackProps };
      } catch (e) {
        return {
          status: 'failed',
          error: e.message,
        };
      }
    },
  );

  const result = await Promise.all(fileProcesses);

  return res.json(result);
});

export default UploadRouter;
