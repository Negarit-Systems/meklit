import { app } from './app.js';
import { config } from './config/config.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from '../swagger.js';

const port = config().port;

// Serve Swagger UI at /api-docs
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, { explorer: true }),
);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(
    `Swagger UI available at http://localhost:${port}/api-docs`,
  );
});
