// Proxy para uso em desenvolvimento local com `npm start` (ng serve),
// evitando problemas de CORS ao chamar a API rodando em localhost:8080.
const PROXY_CONFIG = [
    {
        context: ['/api'],
        target: 'http://localhost:8080',
        secure: false,
        changeOrigin: true,
        logLevel: 'debug'
    }
];

module.exports = PROXY_CONFIG;
