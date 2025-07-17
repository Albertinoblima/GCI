import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import authSchema from '../schemas/authSchema.json' with { type: 'json' };

const router = Router();
router.post('/login', validationMiddleware(authSchema), login);
router.get('/me', authMiddleware(), (req, res) => {
    res.status(200).json({ status: 'success', data: { usuario: req.user } });
});
export default router;