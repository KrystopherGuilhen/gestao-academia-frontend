# ------------------------------------------
# Etapa 1: Build da aplicação Angular
# ------------------------------------------
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm ci

# Copia todo o restante do código-fonte
COPY . .

# Build com configuração única (sempre prod)
RUN npm run build -- --configuration prod



# ------------------------------------------
# Etapa 2: Servidor estático com Nginx
# ------------------------------------------
FROM nginx:alpine

# Instala o envsubst (parte do pacote gettext)
RUN apk add --no-cache gettext

# Define o diretório raiz onde o Nginx vai servir
WORKDIR /usr/share/nginx/html

# Remove os arquivos padrão do Nginx
RUN rm -rf ./*

# Copia os arquivos gerados pelo build do Angular
COPY --from=builder /app/dist/gestao-academia-frontend/ ./

# Copia o template de configuração do Nginx (com placeholders ${BACKEND_HOST}/${BACKEND_PORT},
# substituídos em tempo de execução pelo entrypoint.sh)
RUN mkdir -p /etc/nginx/templates
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

# Copia o template de configuração runtime (placeholders ${…})
COPY src/assets/env.template.js ./assets/env.template.js

# Copia e habilita o entrypoint que vai gerar o env.js
COPY docker/front/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expõe a porta 80 (padrão do Nginx)
EXPOSE 80

# Define o entrypoint: gera env.js e depois inicia o Nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]