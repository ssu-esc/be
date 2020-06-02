import Express from 'express';
import CORS from 'cors';
import Multer from 'multer';
import NodeID3 from 'node-id3';
import fs from 'fs';
import { OAuth2Client } from 'google-auth-library';

import { ApolloServer } from 'apollo-server-express';
import DB from './db';

import { typeDefs, resolvers } from './schema';

const app = Express();
const port = process.env.PORT || 3000;
const upload = Multer({ dest: 'uploads/' });

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

app.post('/upload', upload.array('files'), (req, res) => {
  if (!req.files) {
    return res.status(400).json({ status: 'error', message: 'empty file' });
  }

  const tags = (req.files as Array<{ path: string; originalname: string }>).map(
    (file) => {
      const tag = NodeID3.read(file.path);
      fs.unlinkSync(file.path);

      const { title, artist, performerInfo, album, image } = tag;

      return {
        title: title ?? file.originalname,
        artist: artist ?? '알 수 없는 아티스트',
        performerInfo,
        album: album ?? '알 수 없는 앨범',
        image,
      };
    },
  );

  console.log(tags);

  return res.json({
    status: 'ok',
    ...tags.map(({ image, ...rest }) => rest),
  });
});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers.authorization?.substring(7) || '';
    if (token === '') return { uid: '' };
    try {
      const oAuthClientID = process.env.OAUTH_CLIENT_ID;
      const oAuthClient = new OAuth2Client(oAuthClientID);
      const ticket = await oAuthClient.verifyIdToken({
        idToken: token,
        audience: oAuthClientID || '',
      });
      return { uid: ticket.getPayload()?.sub };
    } catch {
      return { uid: '' };
    }
  },
  introspection: true,
  playground: true,
});

apolloServer.applyMiddleware({ app });

app.listen(port, () =>
  console.log(`Express: Server listening at http://localhost:${port}/`),
);
