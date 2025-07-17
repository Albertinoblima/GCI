// gci-backend/src/config/db.js

import pg from 'pg';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Verifica se o ambiente é de teste
const isTestEnvironment = process.env.NODE_ENV === 'test';

// Define a configuração do banco de dados com base no ambiente
const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    // Usa o banco de dados de teste se NODE_ENV for 'test', caso contrário, usa o de desenvolvimento/produção
    database: isTestEnvironment ? process.env.DB_DATABASE_TEST : process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10) || 5432, // Converte a porta para número
};

// Validação para garantir que as variáveis de ambiente essenciais foram carregadas
if (!dbConfig.user || !dbConfig.host || !dbConfig.database || !dbConfig.password || !dbConfig.port) {
    const dbTarget = isTestEnvironment ? 'de teste' : 'de desenvolvimento/produção';
    console.error(`ERRO FATAL: As variáveis de ambiente do banco de dados ${dbTarget} não estão definidas.`);
    console.error('Verifique se o arquivo .env existe e contém DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, e DB_PORT.');
    process.exit(1); // Encerra a aplicação se a configuração do DB estiver ausente
}

// Cria a pool de conexões
const pool = new pg.Pool(dbConfig);

// Adiciona um listener de erro para o pool, uma prática recomendada para capturar problemas de conexão
pool.on('error', (err, client) => {
    console.error('Erro inesperado em um cliente de banco de dados ocioso:', err);
    process.exit(-1);
});

// Mensagem de log para confirmar a qual banco de dados a aplicação se conectou
pool.on('connect', (client) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Conectado ao banco de dados: ${client.database} no host ${client.host}`);
    }
});


// Exporta a pool para ser usada em outras partes da aplicação
export default pool;