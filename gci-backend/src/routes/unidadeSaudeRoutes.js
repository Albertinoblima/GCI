// gci-backend/src/routes/unidadeSaudeRoutes.js
import { Router } from 'express';
import { create, listAll, listByMunicipio, getById, update, remove } from '../controllers/unidadeSaudeController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import normalizeDataMiddleware from '../middlewares/normalizeDataMiddleware.js';
import createUnidadeSaudeSchema from '../schemas/createUnidadeSaudeSchema.json' with { type: 'json' };
import updateUnidadeSaudeSchema from '../schemas/updateUnidadeSaudeSchema.json' with { type: 'json' };
import express from 'express';

const router = Router();
const jsonParser = express.json();
const ROLES = ['admin_sistema', 'admin_municipio'];
router.use(authMiddleware(ROLES));

// Rota GET geral para listar unidades do município do usuário logado
router.get('/', listAll);

// Rota para listar todas as unidades de um município específico
router.get('/municipio/:municipioId', listByMunicipio);

// Rota para buscar unidade específica por ID
router.get('/:id', getById);

// Rotas para criar, atualizar e deletar uma unidade
router.post('/', jsonParser, normalizeDataMiddleware, validationMiddleware(createUnidadeSaudeSchema), create);
router.put('/:id', jsonParser, normalizeDataMiddleware, validationMiddleware(updateUnidadeSaudeSchema), update);
router.delete('/:id', remove);

export default router;