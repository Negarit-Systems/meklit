import router from './routes';
import express from 'express';
import { logger, errorHandler } from './middlewares';
const app = express();

app.use(logger);
app.use(router);
app.use(errorHandler);

export default app;
