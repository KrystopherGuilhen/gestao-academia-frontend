#!/usr/bin/env sh
set -e

# Valores padrao (usados se as variaveis nao forem definidas no docker-compose/docker run)
export BACKEND_HOST="${BACKEND_HOST:-localhost}"
export BACKEND_PORT="${BACKEND_PORT:-8080}"
export PRODUCTION="${PRODUCTION:-true}"
export BASE_URL="${BASE_URL:-/}"

echo ">> Gerando configuracao do Nginx (proxy /api -> ${BACKEND_HOST}:${BACKEND_PORT})..."
# IMPORTANTE: a lista entre aspas restringe quais variaveis o envsubst troca.
# Sem essa lista, o envsubst tambem tentaria substituir as variaveis nativas
# do proprio Nginx (como $uri, $host, $remote_addr), quebrando o proxy.
envsubst '${BACKEND_HOST} ${BACKEND_PORT}' \
    < /etc/nginx/templates/nginx.conf.template \
    > /etc/nginx/conf.d/default.conf

echo ">> Gerando assets/env.js a partir do template..."
envsubst '${PRODUCTION} ${BASE_URL}' \
    < /usr/share/nginx/html/assets/env.template.js \
    > /usr/share/nginx/html/assets/env.js
rm /usr/share/nginx/html/assets/env.template.js

echo ">> Iniciando Nginx..."
exec "$@"
