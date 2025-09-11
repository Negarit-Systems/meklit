import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../docs/openapiv3.json' with { type: 'json' };
import router from './routes/index.js';
import { config } from './config/config.js';
import { app } from './app.js';

const port = config().port;

// Routes
app.use('/api', router);

// Swagger setup
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument),
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(
    `Swagger UI available at http://localhost:${port}/api/docs`,
  );
});
