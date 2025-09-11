import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Meklit API',
      version: '1.0.0',
      description:
        'API documentation for Meklit project',
    },
    servers: [
      {
        url: 'http://localhost:4000', 
        description: 'Development server',
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
    security: [{ bearerAuth: [] }], // Optional: Apply global auth
  },
  apis:['./src/routes/*.ts', './src/controllers/*.ts'], // Paths to files with JSDoc comments (adjust to your structure)
};

const specs = swaggerJsdoc(options);

export default specs;
