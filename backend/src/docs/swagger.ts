import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Transactions Dispute Portal API',
      version: '1.0.0',
      description:
        'RESTful API for the Transactions Dispute Portal — allows customers to view transactions and raise disputes, and admins to manage dispute resolution.',
    },
    servers: [{ url: '/api/v1', description: 'API v1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/docs/*.yaml'],
};

export const setupSwagger = (app: Express) => {
  const spec = swaggerJsdoc(options);
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(spec));
};
