# GCI Backend - Deploy em Produção

## Pré-requisitos
- Node.js 18+
- PostgreSQL 13+
- Variáveis de ambiente configuradas em `.env.production` (NUNCA versionar)

## Passos para Deploy

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure o banco de dados
- Crie o banco e usuário seguro no PostgreSQL.
- Execute os scripts de estrutura e ajuste de colunas (veja instruções anteriores).
- Preencha as variáveis de ambiente com as credenciais corretas.

### 3. Popule dados iniciais (opcional)
```bash
npm run seed-users
```

### 4. Inicie o backend em produção
```bash
NODE_ENV=production node src/server.js
```
Ou use um gerenciador de processos como PM2:
```bash
pm install -g pm2
pm run build # (se houver build)
pm start # ou pm2 start src/server.js --name gci-backend
```

### 5. Segurança
- Use JWT_SECRET forte.
- Restrinja CORS para o domínio do frontend.
- Nunca exponha `.env.production`.

### 6. Logs
- Os logs ficam em `logs/app-error.log` e `logs/app-info.log`.
- Limpe ou rotacione periodicamente.

### 7. Teste
- Teste todos os endpoints críticos antes de liberar para produção.

---

Para dúvidas ou problemas, consulte a documentação do projeto ou entre em contato com o administrador do sistema.
