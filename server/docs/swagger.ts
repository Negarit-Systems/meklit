import swaggerAutogen from 'swagger-autogen';

const PORT = process.env.PORT || 5000;

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
      url: `http://localhost:${PORT}/api/v1`,
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
