import Express from 'express';
import CORS from 'cors';
import Multer from 'multer';
import NodeID3 from 'node-id3';
import Sharp from 'sharp';
import ShortID from 'shortid';

import { ApolloServer } from 'apollo-server-express';
import DB from './db';

import { getUID } from './auth';
import { fileUpload } from './storage';
import { typeDefs, resolvers } from './schema';

const app = Express();
const port = process.env.PORT || 3000;
const upload = Multer({ storage: Multer.memoryStorage() });

app.use(CORS());

DB.authenticate()
  .then(() => {
    console.log('Database: Authenticate success');
  })
  .catch((err: any) => {
    console.error('Database: Authenticate error:', err);
  });

DB.sync();

app.get('/', (_, res) => {
  res.send('🤔');
});

app.post('/upload', upload.array('files'), async (req, res) => {
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

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => ({
    uid: await getUID(req.headers.authorization),
  }),
  introspection: true,
  playground: true,
});

apolloServer.applyMiddleware({ app });

app.listen(port, () =>
  console.log(`Express: Server listening at http://localhost:${port}/`),
);
