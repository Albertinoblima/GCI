# Dockerfile para GCI Backend (Node.js + PostgreSQL)
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm install --production

# Copia o restante do código
COPY . .

# Expõe a porta padrão do backend
EXPOSE 3001

# Define variáveis de ambiente padrão (pode ser sobrescrito no deploy)
ENV NODE_ENV=production

# Comando para iniciar o backend
CMD ["node", "src/server.js"]
