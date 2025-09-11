import { app } from './app.js';
import { config } from './config/config.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const port = config().port;
const swaggerSpecs = YAML.load('./docs/swagger.yaml');
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
