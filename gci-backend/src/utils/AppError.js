// gci-backend/src/utils/AppError.js

/**
 * Classe de erro customizada para a aplicação.
 * Permite a criação de erros operacionais com um código de status HTTP e um código de erro interno.
 *
 * @class AppError
 * @extends {Error}
 */
class AppError extends Error {
    /**
     * Cria uma instância de AppError.
     * @param {string} message - A mensagem de erro para o cliente.
     * @param {number} statusCode - O código de status HTTP (ex: 400, 404, 500).
     * @param {string} [errorCode] - Um código de erro interno opcional para tratamento programático (ex: 'VALIDATION_ERROR', 'DB_UNIQUE_VIOLATION').
     */
    constructor(message, statusCode, errorCode) {
        // Chama o construtor da classe pai (Error) com a mensagem.
        super(message);

        // Define as propriedades customizadas.
        this.statusCode = statusCode;
        // Determina o status ('fail' para erros 4xx, 'error' para 5xx).
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.errorCode = errorCode;
        // Marca este erro como um erro operacional, ou seja, um erro previsto e confiável.
        this.isOperational = true;

        // Captura o stack trace, excluindo o nosso construtor da pilha de chamadas.
        Error.captureStackTrace(this, this.constructor);
    }
}

// Usar export default é mais idiomático para classes que são a única exportação do arquivo.
export default AppError;