import router from './routes/index.js';
import express from 'express';
import { logger, errorHandler } from './middlewares/index.js';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);
app.use(router);
app.use(errorHandler);

export { app };
