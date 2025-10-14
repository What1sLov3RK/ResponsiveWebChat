import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'WebChats API',
    description: 'Auto-generated Swagger documentation',
  },
  host: 'localhost:4000',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter JWT token: Bearer <token>',
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['../app.js'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
