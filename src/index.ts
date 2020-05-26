import Express from 'express';
import Multer from 'multer';
import NodeID3 from 'node-id3';
import fs from 'fs';

import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './schema';

const app = Express();
const port = process.env.PORT || 3000;
const upload = Multer({ dest: 'uploads/' });

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
  introspection: true,
  playground: true,
});

apolloServer.applyMiddleware({ app });

app.listen(port, () =>
  console.log(`Express: Server listening at http://localhost:${port}/`),
);
