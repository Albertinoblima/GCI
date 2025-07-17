import express from 'express';
// ... outras importações (cors, etc.)

import authRoutes from './routes/authRoutes.js';
import municipioRoutes from './routes/municipioRoutes.js';
import cidadaoRoutes from './routes/cidadaoRoutes.js';
import { globalErrorHandler, routeNotFoundHandler } from './middlewares/errorMiddleware.js';

const app = express();

// Middlewares globais
app.use(express.json());
// ... outros middlewares (cors, etc.)

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/municipios', municipioRoutes);
app.use('/api/cidadaos', cidadaoRoutes);
// app.use('/api/municipios', municipioRoutes); // Outras rotas

// Handlers de Erro (devem ser os últimos)
app.use(routeNotFoundHandler);
app.use(globalErrorHandler);

export default app;
