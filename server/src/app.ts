import router from './routes/index.js';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../docs/openapiv3.json' with { type: 'json' };
import { logger, errorHandler } from './middlewares/index.js';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger setup
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument),
);

app.use(logger);
app.use('/api/v1', router);
app.use(errorHandler);

export { app };
