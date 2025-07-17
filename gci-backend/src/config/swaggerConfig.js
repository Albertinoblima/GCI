import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API GCI - Gestão de Cidades Inteligentes',
            version: '1.0.0',
            description: 'Documentação da API RESTful para o sistema GCI, que gerencia atendimentos, módulos de saúde, educação e mais.',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3001}/api`,
                description: 'Servidor de Desenvolvimento'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    // Caminho para os arquivos que contêm as anotações da API (JSDoc)
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;