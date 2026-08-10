# Gestão Acadêmica — Frontend

Aplicação web (Angular + PrimeNG) para o sistema de gestão de matrículas acadêmicas: cadastro de
alunos, cursos, disciplinas e turmas, e o fluxo de matrícula de alunos em turmas.

**Autor:** Krystopher Francisco Guilhen de Matos
**Contato:** krystopher.guilhen@outlook.com

> Este repositório contém **apenas o frontend**. O backend (Spring Boot) vive em um repositório
> separado: `gestao-academia-backend`. Este frontend **não funciona sozinho** — ele precisa do
> backend rodando para ter dados. Veja [Uso em conjunto com o backend](#uso-em-conjunto-com-o-backend).

---

## Sumário

- [Stack tecnológica](#stack-tecnológica)
- [Pré-requisitos e instalação das tecnologias](#pré-requisitos-e-instalação-das-tecnologias)
- [Uso em conjunto com o backend](#uso-em-conjunto-com-o-backend)
- [Como executar](#como-executar)
- [Build e publicação da imagem Docker](#build-e-publicação-da-imagem-docker)
- [Variáveis de ambiente / configuração de runtime](#variáveis-de-ambiente--configuração-de-runtime)
- [Funcionalidades](#funcionalidades)
- [Decisões técnicas](#decisões-técnicas)
- [Limitações conhecidas](#limitações-conhecidas)
- [Uso de IA](#uso-de-ia)

---

## Stack tecnológica

| Item | Tecnologia |
|---|---|
| Framework | Angular 17 |
| Componentes UI | PrimeNG 17 (template Sakai) |
| Linguagem | TypeScript |
| HTTP/Reatividade | RxJS |
| Autenticação | JWT (token salvo no `localStorage`, enviado via interceptor HTTP) |
| Build | Angular CLI / Node.js |
| Container | Docker + Nginx (produção) |

---

## Pré-requisitos e instalação das tecnologias

Você não precisa instalar tudo — escolha **uma** das rotas abaixo.

### Rota rápida: só Docker

- **Docker** e **Docker Compose**
  - Windows/Mac: instale o Docker Desktop (https://www.docker.com/products/docker-desktop/).
  - Linux: siga o guia oficial de instalação do Docker Engine
    (https://docs.docker.com/engine/install/) e instale também o `docker-compose-plugin`.
  - Confirme com:
    ```bash
    docker --version
    docker compose version
    ```

### Rota completa: rodando sem Docker (desenvolvimento local)

1. **Node.js 20+** e **npm**
   - Baixe em https://nodejs.org/ (recomenda-se a versão LTS mais recente), ou use um gerenciador de
     versões como o nvm (https://github.com/nvm-sh/nvm):
     ```bash
     nvm install 20
     nvm use 20
     ```
   - Confirme a instalação:
     ```bash
     node -v
     npm -v
     ```

2. **Angular CLI** (opcional, mas recomendado para comandos como `ng generate`) — não é
   estritamente necessário para só rodar o projeto, já que os scripts do `package.json` chamam o CLI
   local instalado nas dependências. Se quiser instalar globalmente:
   ```bash
   npm install -g @angular/cli@17
   ```

3. **Dependências do projeto**:
   ```bash
   npm install
   ```

---

## Uso em conjunto com o backend

Este frontend **precisa** do backend (`gestao-academia-backend`) rodando para funcionar de verdade
(login, listar alunos, cursos, etc). Existem três formas de conectar os dois:

### Opção A — Ambos via Docker, na mesma rede (recomendado para "produção local")

O frontend, quando rodando via Docker, usa um **Nginx com proxy reverso**: toda chamada para
`/api/*` feita pelo navegador é encaminhada internamente pelo Nginx para o container do backend,
usando a rede Docker compartilhada entre os dois repositórios. Isso significa **zero configuração de
CORS** e uma única origem para o usuário final.

1. Crie a rede Docker compartilhada (uma única vez; se já existir, o comando só avisa e não há problema):
   ```bash
   docker network create gestao-academia-network
   ```
2. Suba o backend primeiro (no repositório `gestao-academia-backend`):
   ```bash
   cd ../gestao-academia-backend
   cp .env.example .env
   docker compose up --build -d
   ```
3. Suba este frontend:
   ```bash
   cd ../gestao-academia-frontend
   docker compose up --build
   ```
4. Acesse **http://localhost:4200**.

Por padrão, o `docker-compose.yml` deste frontend já assume que o serviço do backend na rede
compartilhada se chama `backend` e está na porta `8080` (é exatamente como o `docker-compose.yml` do
backend está configurado). Se você alterou esses nomes no lado do backend, ajuste ao subir:
```bash
BACKEND_HOST=meu-servico-backend BACKEND_PORT=9090 docker compose up --build
```

### Opção B — Frontend em modo desenvolvimento (`ng serve`) + backend via Docker ou local

Mais prático no dia a dia de desenvolvimento (hot-reload do Angular):

```bash
npm install
npm run start:proxy
```

O script `start:proxy` usa o `proxy.conf.js`, que redireciona toda chamada `/api/*` feita pelo
Angular para `http://localhost:8080` — ou seja, funciona tanto se o backend estiver rodando via
`docker compose up` (porta publicada `8080`) quanto via `./mvnw spring-boot:run` no repositório dele.
A aplicação sobe em **http://localhost:4200**.

### Opção C — Frontend via Docker, backend rodando fora do Docker

Se o backend estiver rodando direto na máquina host (fora de container), o container do frontend não
consegue alcançar `localhost` do host por padrão. Nesse caso, use o modo "sem Docker" deste frontend
(`npm run start:proxy`, Opção B) em vez do `docker-compose.yml`, que é pensado para o cenário
container-com-container da Opção A.

---

## Como executar

### Com Docker

Sozinho, para conferir a interface sem um backend real (as chamadas à API vão falhar, mas dá pra
navegar pela interface):
```bash
docker compose up --build
```
Acesse **http://localhost:4200**. Veja [Uso em conjunto com o backend](#uso-em-conjunto-com-o-backend)
para rodar com dados de verdade.

### Sem Docker (desenvolvimento)

```bash
npm install
npm run start:proxy
```

Ou, sem o proxy (você precisa então configurar a URL da API manualmente em
`src/environments/environment.ts`, campo `baseUrl`):
```bash
npm start
```

### Build de produção (gera os arquivos estáticos em `dist/`)

```bash
npm run build
```

---

## Build e publicação da imagem Docker

Esta seção é para quem vai **gerar e publicar** a imagem (manter o projeto), não para quem só quer
rodar — se você só quer rodar, veja [Como executar](#como-executar).

O `Dockerfile` deste projeto faz o `npm install` e o `npm run build` sozinho dentro do container (build
multi-stage: uma etapa com Node completo compila o Angular, a etapa final só leva os arquivos
estáticos gerados e o Nginx). Não precisa rodar `npm install`/`npm run build` manualmente antes.

### 1. Gerar a imagem localmente

```bash
cd gestao-academia-frontend
docker build -t gestao-academia-frontend:latest .
```

### 2. Login no Docker Hub

```bash
docker login
```

### 3. Taguear a imagem (troque `SEU_USUARIO_DOCKERHUB` pelo seu usuário no Docker Hub)

```bash
docker tag gestao-academia-frontend:latest SEU_USUARIO_DOCKERHUB/gestao-academia-frontend:latest
```

### 4. Enviar para o Docker Hub

```bash
docker push SEU_USUARIO_DOCKERHUB/gestao-academia-frontend:latest
```

### Como quem for usar consegue rodar sem buildar nada

O `docker-compose.yml` deste repositório já referencia `SEU_USUARIO_DOCKERHUB/gestao-academia-frontend:latest`
no campo `image` do serviço `frontend` (ajuste esse nome de usuário no arquivo depois de publicar a
sua imagem). Assim, quem for usar o projeto tem as duas opções, com o **mesmo** `docker-compose.yml`:

```bash
# Opção A — baixar a imagem pronta do Docker Hub (não builda nada localmente)
docker compose pull
docker compose up

# Opção B — buildar localmente a partir do código-fonte (ignora a imagem do Hub)
docker compose up --build
```

> Repita os mesmos 4 passos no repositório do backend (`gestao-academia-backend`) para gerar e
> publicar a imagem dele também.

---

## Variáveis de ambiente / configuração de runtime

Diferente do backend, este frontend **não usa um arquivo `.env`** — como é uma aplicação estática
(compilada e servida pelo Nginx), a configuração de runtime é feita via variáveis de ambiente do
próprio container, que o `entrypoint.sh` injeta em um arquivo `assets/env.js` gerado na
inicialização (assim dá pra trocar a URL da API sem precisar rebuildar o bundle Angular a cada
ambiente). As variáveis usadas pelo `docker-compose.yml` deste repositório, com seus valores padrão
já embutidos no próprio arquivo (não é necessário criar nada extra):

| Variável | Padrão | Para que serve |
|---|---|---|
| `PRODUCTION` | `true` | Flag de ambiente de produção |
| `BASE_URL` | `/` | Prefixo usado nas chamadas HTTP (com o proxy reverso do Nginx, fica relativo) |
| `BACKEND_HOST` | `backend` | Nome do serviço do backend na rede Docker compartilhada, para onde o Nginx faz proxy de `/api/*` |
| `BACKEND_PORT` | `8080` | Porta do backend na rede Docker compartilhada |
| `FRONTEND_PORT` | `4200` | Porta publicada no host para acessar o frontend |

Para sobrescrever, exporte antes de subir o compose, por exemplo:
```bash
FRONTEND_PORT=8081 BACKEND_HOST=meu-backend docker compose up --build
```

---

## Funcionalidades

- **Login** com JWT (usuário/senha), protegendo todas as rotas internas via `AuthGuard` +
  `AuthInterceptor`.
- **Alunos, Cursos, Disciplinas, Turmas**: CRUD completo (listar com busca e paginação, criar,
  editar, excluir), usando um motor genérico de tabelas e formulários dinâmicos.
- **Matrículas**: tela dedicada para matricular um aluno em uma turma (só turmas abertas aparecem),
  e uma tabela com ações de "Confirmar" e "Cancelar" que chamam as regras de negócio do backend.
- **Tema claro/escuro**: alternável a qualquer momento pelo botão 🌙/☀️ no topo (tanto na tela de
  login quanto dentro do sistema), com a preferência salva no navegador.
- **Painel de configurações** (ícone de engrenagem no topo): escala da interface, tipo de menu
  (fixo/sobreposto) e estilo dos campos de formulário.

---

## Decisões técnicas

### Origem do frontend

Este frontend partiu de um projeto Angular 17 + PrimeNG já existente do autor (sistema de gestão de
treinamentos), do qual foi reaproveitada a base genérica:

- `ControleService` (HTTP genérico com paginação server-side), um `CrudViewAbstractComponent`
  (tabela PrimeNG com paginação/ordenação/busca lazy) e um `CrudFormsAbstractComponent` com **form
  builder declarativo** — cada tela de cadastro só precisa declarar os campos do formulário (tipo,
  obrigatoriedade, opções de lista), sem reescrever HTML de formulário do zero.
- Layout completo (sidebar, topbar, tema) e o interceptor JWT + guarda de rota.

Sobre essa base foram construídas as 5 telas do domínio acadêmico, removido tudo que era específico
do domínio anterior (Trabalhador, Empresa, Instrutor, Palestra, Unidade, sistema de permissões
granulares, integração com API externa, imagens e textos da marca original) e as páginas de
demonstração do template (uikit, blocks, documentation) sem relação com o projeto.

### Compatibilidade de paginação com o backend

O motor de paginação deste frontend espera a resposta da API no formato `{ data: T[], total: number }`
— o backend foi desenhado exatamente nesse formato para não precisar alterar esse motor genérico.

### Tela de Matrículas foge do padrão CRUD genérico

Diferente das outras 4 telas, a matrícula tem um ciclo de vida próprio (criar → confirmar → cancelar,
sem edição livre de campos), então usa um formulário simples e independente (dois dropdowns + botão)
em vez do form builder dinâmico completo — que seria complexidade desnecessária para um formulário de
dois campos.

### Proxy reverso via Nginx (Docker) em vez de CORS

Ao rodar via Docker, o frontend não chama o backend diretamente pela URL pública dele — o próprio
Nginx que serve os arquivos estáticos também repassa `/api/*` para o backend internamente. Isso evita
qualquer configuração de CORS em produção e mantém uma única origem do ponto de vista do navegador.
Em desenvolvimento (`ng serve`), o mesmo efeito é obtido com o `proxy.conf.js` do Angular CLI.

### Tema claro/escuro

O template base (Sakai/PrimeNG) já trazia toda a engine de troca de tema pronta (troca o arquivo CSS
do PrimeNG entre variantes `lara-light-indigo` e `lara-dark-indigo`), mas vinha com uma galeria de
mais de 30 combinações de tema (Bootstrap, Material Design, Tailwind, Fluent UI, etc.) — foi
simplificado para exatamente o que era necessário: um toggle único de claro/escuro, acessível tanto
por um botão de atalho no topo quanto pelo painel de configurações, com a preferência persistida no
`localStorage`.

---

## Limitações conhecidas

- **Sem testes automatizados de frontend** (Jasmine/Karma vêm configurados pelo Angular CLI por
  padrão, mas não foram escritos testes específicos para os componentes deste domínio).
- **Filtro único (busca global)** nas tabelas, sem filtros avançados por múltiplos campos
  simultâneos — suficiente para os cenários de consulta do domínio, mas menos flexível que filtros
  dedicados por coluna.
- **Sem tela de cadastro de novos usuários de login** — o único usuário existente é criado via seed
  no backend.
- **Ilustrações/ícones são SVGs simples criados para o projeto**, não substituem uma identidade
  visual profissional caso este projeto evolua para uso real.

---

## Uso de IA

Este projeto foi desenvolvido com apoio intensivo do **Claude (Anthropic)**, usado como par de
desenvolvimento durante praticamente todo o processo. Registro aqui com transparência onde e como:

- **Leitura e adaptação de um projeto de referência**: o Claude leu um frontend Angular já existente
  do autor (sistema de gestão de treinamentos) para identificar os componentes genéricos
  reaproveitáveis (tabela, formulário dinâmico, serviço HTTP) e adaptá-los a este novo domínio,
  removendo o que era específico do contexto anterior.
- **Construção das telas**: as 5 telas do domínio (Alunos, Cursos, Disciplinas, Turmas, Matrículas),
  a tela de login, o dashboard e o toggle de tema foram implementados com apoio do Claude.
- **Revisão manual**: o ambiente usado durante a criação não tinha acesso a um Angular CLI completo
  com todas as dependências instaladas para compilar (`ng build`) e validar automaticamente a cada
  alteração. O código foi escrito com atenção manual a nomes corretos de imports/seletores/módulos
  do PrimeNG 17 e revisado item a item (busca por referências quebradas após renomeações de
  arquivos). Ainda assim, **recomenda-se rodar `npm install && ng build` logo após clonar** para
  pegar qualquer detalhe que a revisão manual não tenha capturado.
- **Trecho mais crítico** para revisão adicional: a configuração do proxy reverso do Nginx
  (`nginx.conf.template` + `docker/front/entrypoint.sh`), que depende da rede Docker compartilhada
  com o backend estar corretamente criada e nomeada (`gestao-academia-network`) — se o frontend não
  conseguir falar com o backend em produção via Docker, comece verificando essa rede e os nomes de
  serviço.

Estou à disposição para explicar qualquer decisão, trecho de código específico, ou os trade-offs de
cada simplificação listada acima.
