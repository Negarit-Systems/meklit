import swaggerAutogen from 'swagger-autogen';
import { config } from '../src/config/config.js';

const { port } = config();
const doc = {
  info: {
    title: 'Meklit API',
    description: 'Description',
    externalDocs: {
      url: 'api.json',
    },
  },
  servers: [
    {
      url: `http://localhost:${port}/api/v1`,
    },
    {
      url: `https://meklit-api.negaritsystems.com.et/api`,
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const outputFile = './openapiv3.json';
const routes = ['./src/routes/index.ts'];

const swaggerAutogenInstance = swaggerAutogen({ openapi: '3.0.0' });

swaggerAutogenInstance(outputFile, routes, doc);
