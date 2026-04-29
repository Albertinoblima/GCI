// gci-backend/src/server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';

// Módulos da aplicação
import * as config from './config/appConfig.js';
import logger from './utils/logger.js';
import mainApiRoutes from './routes/index.js';
import metaWebhookRoutes from './routes/metaWebhookRoutes.js';
import { globalErrorHandler, routeNotFoundHandler } from './middlewares/errorMiddleware.js';

// --- Inicialização do Servidor Express ---
const app = express();

// --- Configuração de Middlewares Globais ---

// 1. CORS: Deve ser o primeiro middleware para lidar com requisições de diferentes origens.
const corsOrigins = process.env.NODE_ENV === 'production'
    ? [config.frontendUrl]
    : [config.frontendUrl, 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// 2. Body Parsers: Essencial que venham ANTES das rotas para popular o req.body.
// Para parsear corpos de requisição application/json
app.use(express.json({ limit: config.upload.maxPayloadSize }));
// Para parsear corpos de requisição application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// 3. Log de Requisições: Útil para depuração.
app.use((req, res, next) => {
    // Não logar requisições durante os testes para manter o output limpo
    if (process.env.NODE_ENV !== 'test') {
        logger.http(`[REQUEST] ${req.method} ${req.originalUrl}`, { ip: req.ip });
    }
    next();
});

// --- Rota da Documentação da API (se você a tiver) ---
// import swaggerUi from 'swagger-ui-express';
// import swaggerSpec from './config/swaggerConfig.js';
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Rotas Principais da API ---
// Todas as requisições para /api serão tratadas pelo nosso roteador principal.
app.use('/api', mainApiRoutes);

// Rota exclusiva para o webhook da Meta (usa express.raw APENAS aqui)
app.use('/webhook/meta', express.raw({ type: 'application/json' }), metaWebhookRoutes);

// Rota raiz para verificação de status
app.get('/', (req, res) => {
    res.status(200).send('<h1>🚀 Servidor GCI Backend está no ar!</h1>');
});

// --- Tratamento de Erros (devem ser os últimos middlewares) ---
// Captura rotas não encontradas e passa para o handler de erro.
app.use(routeNotFoundHandler);
// Captura todos os outros erros passados via next(error).
app.use(globalErrorHandler);


// --- Configuração do Servidor HTTP e Socket.IO ---
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: config.frontendUrl,
        methods: ["GET", "POST"],
    },
});

// Lógica de autenticação e conexão do Socket.IO
// (Mova para um arquivo separado 'socket.js' se ficar muito grande)
io.on('connection', (socket) => {
    logger.info(`Socket conectado: ${socket.id}`);
    socket.on('disconnect', () => {
        logger.info(`Socket desconectado: ${socket.id}`);
    });
});

// --- Inicialização do Servidor ---
if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(config.port, () => {
        logger.info(`💻 Servidor GCI (HTTP + WebSocket) rodando em modo ${config.nodeEnv} na porta ${config.port}`);
    });
}

// Exporta app e server para testes
export { app, httpServer as server, io };