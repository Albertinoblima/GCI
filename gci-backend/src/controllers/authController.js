// gci-backend/src/controllers/authController.js
import authService from '../services/authService.js';

export const login = async (req, res, next) => {
    try {
        const { email, senha } = req.body;
        // O authService já retorna o token e o objeto do usuário
        const { token, usuario } = await authService.login(email, senha);

        // CORREÇÃO: Enviar uma resposta simples e direta.
        res.status(200).json({
            status: 'success',
            token: token, // Envia o token diretamente
            data: {
                usuario: usuario // Envia os dados do usuário aninhados
            }
        });
    } catch (error) {
        next(error);
    }
};