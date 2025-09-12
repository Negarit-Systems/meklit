import router from './routes/index.js';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../docs/openapiv3.json' with { type: 'json' };
import { logger, errorHandler } from './middlewares/index.js';
const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://meklit-api.negaritsystems.com.et',
      'https://meklit.negaritsystems.com.et',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument),
);

app.use('/api', router);
app.use(errorHandler);

export { app };
