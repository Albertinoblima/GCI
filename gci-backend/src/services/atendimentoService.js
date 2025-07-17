// gci-backend/src/services/atendimentoService.js
import atendimentoRepository from '../repositories/atendimentoRepository.js';
import AppError from '../utils/AppError.js';

const atendimentoService = {
    async findAll(usuario, filtros) {
        // Regra de segurança: Se o usuário NÃO for admin do sistema, FORÇA o filtro do seu município.
        if (usuario.role !== 'admin_sistema') {
            filtros.municipioId = usuario.municipio_id;
        }
        return await atendimentoRepository.findAll(filtros);
    },

    // Alias para compatibilidade
    async list(usuario, filtros) {
        return await this.findAll(usuario, filtros);
    },

    async findByIdOrProtocolo(idOrProtocolo, usuario) {
        const atendimento = await atendimentoRepository.findByIdOrProtocolo(idOrProtocolo);
        if (!atendimento) throw new AppError('Atendimento não encontrado.', 404);
        if (usuario.role !== 'admin_sistema' && atendimento.municipio_id !== usuario.municipio_id) {
            throw new AppError('Acesso negado a este atendimento.', 403);
        }
        return atendimento;
    },
    // ... outras funções (create, update, etc.)
};

export default atendimentoService;