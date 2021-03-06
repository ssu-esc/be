import { Router } from 'express';
import Multer from 'multer';
import NodeID3 from 'node-id3';
import Sharp from 'sharp';
import ShortID from 'shortid';

import { upload, remove } from '../util/storage';
import Album from '../db/models/album';
import Track from '../db/models/track';
import { getUser } from '../util/auth';
import { getTrackNumber } from '../util/tag';
import { AuthRequest } from '../types';

const Upload = Multer({ storage: Multer.memoryStorage() });

const UploadRouter = Router();

UploadRouter.post('/', Upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'empty file' });
  }
  const uid = getUser(req);
  const { file } = req;
  if (!uid)
    return res
      .status(400)
      .json({ status: 'error', message: 'valid token required' });
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
    return res.json({ status: 'ok', ...trackProps });
  } catch (e) {
    return res.json({
      status: 'failed',
      error: e.message,
    });
  }
});

UploadRouter.post(
  '/cover/:albumId',
  Upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'empty file' });
    }
    const uid = getUser(req);
    if (!uid)
      return res
        .status(400)
        .json({ status: 'error', message: 'valid token required' });
    const { albumId } = req.params;
    const album = await Album.findOne({
      where: {
        uid,
        albumId,
      },
    });
    if (!album)
      return res
        .status(400)
        .json({ status: 'error', message: 'album not found' });
    const image = await Sharp(req.file.buffer)
      .resize(512, 512, { fit: 'contain' })
      .jpeg({ quality: 75 })
      .toBuffer();
    await upload(`${uid}/${albumId}.jpg`, image);
    await album.update({ hasCover: true });
    return res.json({ status: 'ok' });
  },
);

UploadRouter.delete('/cover/:albumId', async (req, res) => {
  const uid = getUser(req);
  if (!uid)
    return res
      .status(400)
      .json({ status: 'error', message: 'valid token required' });
  const { albumId } = req.params;
  const album = await Album.findOne({
    where: {
      uid,
      albumId,
    },
  });
  if (!album)
    return res
      .status(400)
      .json({ status: 'error', message: 'album not found' });
  await remove(`${uid}/${albumId}.jpg`);
  await album.update({ hasCover: false });
  return res.json({ status: 'ok' });
});

export default UploadRouter;
