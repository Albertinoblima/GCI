// gci-backend/src/utils/helpers.js

/**
 * Verifica se um valor é nulo ou indefinido.
 * @param {*} value - O valor a ser verificado.
 * @returns {boolean} True se o valor for nulo ou indefinido, false caso contrário.
 */
export function isNil(value) {
    return value === null || value === undefined;
}

/**
 * Verifica se um objeto está vazio.
 * @param {object} obj - O objeto a ser verificado.
 * @returns {boolean} True se o objeto for nulo, indefinido ou não tiver propriedades próprias.
 */
export function isEmptyObject(obj) {
    if (isNil(obj)) {
        return true;
    }
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * Capitaliza a primeira letra de uma string.
 * @param {string} str - A string a ser capitalizada.
 * @returns {string} A string com a primeira letra maiúscula.
 */
export function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Gera uma string aleatória de um determinado tamanho.
 * Útil para senhas temporárias, tokens de verificação (mas para JWT use jsonwebtoken).
 * @param {number} length - O tamanho da string a ser gerada.
 * @returns {string} A string aleatória.
 */
export function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Simples função de debounce para atrasar a execução de uma função.
 * @param {function} func - A função a ser "debounced".
 * @param {number} delay - O atraso em milissegundos.
 * @returns {function} A nova função "debounced".
 */
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Formata um objeto de erro para uma resposta de API mais padronizada.
 * @param {Error | {status?: number, message: string, details?: any}} err - O objeto de erro.
 * @param {string} [defaultMessage='Erro interno do servidor.'] - Mensagem padrão se err.message não existir.
 * @returns {{status: number, body: {error: string, details?: any}}}
 */
export function formatErrorResponse(err, defaultMessage = 'Erro interno do servidor.') {
    const status = err.status || 500;
    const message = err.message || defaultMessage;
    const responseBody = { error: message };
    if (err.details) {
        responseBody.details = err.details;
    }
    // Em dev, pode-se adicionar o stack (mas cuidado para não expor em produção)
    // if (config.nodeEnv === 'development' && err.stack) {
    //     responseBody.stack = err.stack;
    // }
    return { status, body: responseBody };
}

/**
 * Adicione outras funções helper conforme necessário
 */