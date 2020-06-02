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

app.post('/upload', upload.single('music'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'empty file' });
  }

  const file = req.file.path;
  const tags = NodeID3.read(file);

  fs.unlinkSync(file);

  if (tags == null) {
    return res.status(400).json({ status: 'error', message: 'tag not found' });
  }
  return res.json({ status: 'ok', ...tags });
});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers.authorization?.substring(7) || '';
    if (token === '') return { uid: '' };
    try {
      const oauthClientID = process.env.OAUTH_CLIENT_ID;
      const oauthClient = new OAuth2Client(oauthClientID);
      const ticket = await oauthClient.verifyIdToken({
        idToken: token,
        audience: oauthClientID || '',
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
