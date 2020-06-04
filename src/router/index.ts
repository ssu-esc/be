import { Router } from 'express';

const IndexRouter = Router();

IndexRouter.get('/', (_, res) => {
  res.send('🤔');
});

export default IndexRouter;
