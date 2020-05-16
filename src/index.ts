import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_, res) => {
  res.send('🤔');
});

app.listen(port, () =>
  console.log(`Express: Server listening at http://localhost:${port}/`),
);
