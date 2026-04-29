# GCI - Sistema de Gestao de Cidades Inteligentes

Repositorio principal do projeto GCI com frontend e backend.

## Estrutura

- `gci/`: frontend (React)
- `gci-backend/`: backend (Node.js + Express + PostgreSQL)

## Publicacao Recomendada (Menor Custo)

- Frontend em hospedagem estatica com subdominio `app.idialog.com.br`
- Backend no Railway com subdominio `api.idialog.com.br`
- Banco PostgreSQL existente mantido (sem recriar) se ja estiver acessivel externamente

## Variaveis Criticas de Producao (Backend)

Definir em `gci-backend/.env.production` ou em variaveis do provedor:

```env
NODE_ENV=production
PORT=3001
DB_HOST=<host>
DB_PORT=5432
DB_USER=<user>
DB_PASSWORD=<password>
DB_DATABASE=<database>
JWT_SECRET=<secret-forte>
FRONTEND_URL=https://app.idialog.com.br
```

## Checklist de Deploy

1. Validar variaveis de ambiente do backend
2. Garantir CORS somente para frontend oficial
3. Publicar backend e validar `/api/health`
4. Publicar frontend e validar rotas SPA
5. Confirmar comunicacao API e Socket

## Seguranca Basica

1. Nao versionar segredos reais
2. Evitar `localhost` hardcoded em configuracoes de producao
3. Fazer backup regular do banco
