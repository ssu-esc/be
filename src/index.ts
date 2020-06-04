import Express from 'express';
import CORS from 'cors';

import IndexRouter from './router/index';
import UploadRouter from './router/upload';
import ApolloServer from './router/apollo';
import Logger from './util/logger';

const App = Express();
const port = process.env.PORT || 3000;

App.use(CORS());

App.use('/', IndexRouter);
App.use('/upload', UploadRouter);
ApolloServer.applyMiddleware({ app: App });

App.listen(port, () =>
  Logger.info(`Server listening at http://localhost:${port}/`, {
    label: 'Express',
  }),
);
