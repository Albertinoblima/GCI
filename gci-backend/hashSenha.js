// gci-backend/hashSenha.js
import bcrypt from 'bcryptjs';

// Senhas dos usuários de teste (devem corresponder ao cypress.config.js)
const senhas = {
    admin_sistema: 'admin123',
    admin_municipio: 'admin123',
    agente_atendimento: 'agente123',
};

async function gerarHashes() {
    console.log('=== GERANDO HASHES DE SENHA PARA TESTES DO CYPRESS ===\n');

    for (const [role, senha] of Object.entries(senhas)) {
        try {
            const hash = await bcrypt.hash(senha, 10);
            console.log(`📧 Role: ${role}`);
            console.log(`🔑 Senha: ${senha}`);
            console.log(`🔐 Hash: ${hash}`);
            console.log('─'.repeat(60));
        } catch (error) {
            console.error(`❌ Erro ao gerar hash para ${role}:`, error);
        }
    }

    console.log('\n✅ Hashes gerados! Use estes valores no script SQL de seed.');
}

// Se o script for executado diretamente
gerarHashes();