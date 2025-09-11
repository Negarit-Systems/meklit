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
      url: `http://localhost:${PORT}/api`,
    },
    {
      url: `https://meklit-api.negaritsystems.com.et/api`,
    },
  ],
  security: [
    {
      oauth2: [],
    },
  ],
  components: {
    securitySchemes: {
      oauth2: {
        type: 'oauth2',
        flows: {
          implicit: {
            authorizationUrl:
              'https://<AUTHSERVERURL>/protocol/openid-connect/auth',
            scopes: {
              roles: 'roles',
              read: 'read',
              write: 'write',
            },
          },
        },
      },
    },
  },
};

const outputFile = './openapiv3.json';
const routes = ['./src/routes/index.ts'];

const swaggerAutogenInstance = swaggerAutogen({ openapi: '3.0.0' });

swaggerAutogenInstance(outputFile, routes, doc);
