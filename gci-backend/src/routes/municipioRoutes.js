// gci-backend/src/routes/municipioRoutes.js
import express from 'express'; // 1. Importar express
import { Router } from 'express';
import { getAllMunicipios, createMunicipio, getMunicipioById, updateMunicipio, deleteMunicipio } from '../controllers/municipioController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import createSchema from '../schemas/createMunicipioSchema.json' with { type: 'json' };
import updateSchema from '../schemas/updateMunicipioSchema.json' with { type: 'json' };

// Importe o roteador filho
import secretariaRoutes from './secretariaRoutes.js';

const router = Router();

// ===================================================================
// ROTAS DE SECRETARIAS (ANINHADAS)
// Defina esta rota PRIMEIRO. Ela tem sua própria lógica de auth interna.
// ===================================================================
router.use('/:municipioId/secretarias', secretariaRoutes);

// ===================================================================
// ROTAS DE MUNICÍPIOS (NÍVEL SUPERIOR)
// Estas rotas SÃO exclusivas do admin_sistema, EXCETO getMunicipioById e updateMunicipio
// que podem ser acessadas por admin_municipio para o próprio município.
// ===================================================================
const protectAdminSistema = authMiddleware(['admin_sistema']);
const protectAdminSistemaOrMunicipio = authMiddleware(['admin_sistema', 'admin_municipio']);

// Separar rotas GET (sem validação) das rotas POST/PUT (com validação)
router.get('/', protectAdminSistema, getAllMunicipios);
router.post('/', protectAdminSistema, validationMiddleware(createSchema), createMunicipio);

router.get('/:id', protectAdminSistemaOrMunicipio, getMunicipioById);
router.put('/:id', protectAdminSistemaOrMunicipio, validationMiddleware(updateSchema), updateMunicipio);
router.delete('/:id', protectAdminSistema, deleteMunicipio);

export default router;