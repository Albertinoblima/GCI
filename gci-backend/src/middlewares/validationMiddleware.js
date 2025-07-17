import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import AppError from '../utils/AppError.js';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export const validationMiddleware = (schema) => {
    if (!schema) {
        throw new Error('Schema de validação não fornecido.');
    }
    const validate = ajv.compile(schema);

    return (req, res, next) => {
        if (!validate(req.body)) {
            const errors = validate.errors.map(e => ({
                path: e.instancePath.replace('/', '') || e.params?.missingProperty || 'unknown',
                message: e.message,
                value: e.data
            }));

            const appError = new AppError('Dados de entrada inválidos.', 400);
            appError.errors = errors;
            return next(appError);
        }

        next();
    };
};