(function (window) {
  window.__env = window.__env || {};

  // Flag de producao
  window.__env.production = ("${PRODUCTION}" === "true");

  // Base URL da API backend, injetada em tempo de execucao pelo container
  // (permite trocar de ambiente sem rebuildar o bundle Angular)
  window.__env.baseUrl = "${BASE_URL}";

}(this));
