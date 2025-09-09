import { configDotenv } from 'dotenv';
import express from 'express';

const app = express();
configDotenv();

app.get('/', (req, res) => {
  return res.json('HELLO WORLD');
});

app.listen(process.env.PORT, () => {
  console.log(`This app listens to http://localhost:${process.env.PORT}`);
});
