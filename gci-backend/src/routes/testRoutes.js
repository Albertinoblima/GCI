import { Router } from 'express';
import db from '../config/db.js';

const router = Router();
router.get('/ping', (req, res) => res.status(200).json({ message: 'Pong!' }));
router.get('/db-check', async (req, res, next) => {
    try {
        const result = await db.query('SELECT NOW() as now;');
        res.status(200).json({ status: 'success', message: 'Conexão bem-sucedida!', db_time: result.rows[0].now });
    } catch (err) {
        next(err);
    }
});
export default router;