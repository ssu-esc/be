import Express from 'express';
import CORS from 'cors';

import IndexRouter from './router/index';
import UploadRouter from './router/upload';
import ApolloServer from './router/apollo';
import Logger from './util/logger';
import { checkJWT } from './util/auth';

const App = Express();
const port = process.env.PORT || 3000;

App.use(CORS());

App.use('/', IndexRouter);

App.use(checkJWT);

App.use('/upload', UploadRouter);
ApolloServer.applyMiddleware({ app: App });

App.use((error: Error, req: any, res: any, next: Function) => {
  Logger.error(error.message, {
    label: 'Express',
  });
  next();
});

App.listen(port, () =>
  Logger.info(`Server listening at http://localhost:${port}/`, {
    label: 'Express',
  }),
);
