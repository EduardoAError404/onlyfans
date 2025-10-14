# 🚀 OnlyFans Clone - Análise e Documentação Completa

Este documento fornece uma análise técnica detalhada e um guia completo para o projeto "OnlyFans Clone". O objetivo é servir como uma documentação central para desenvolvedores, administradores e para o planejamento de futuras melhorias.

---

## 📜 Índice

1.  [**Visão Geral**](#1-visão-geral)
2.  [**Funcionalidades**](#2-funcionalidades)
3.  [**Arquitetura do Sistema**](#3-arquitetura-do-sistema)
4.  [**Stack Tecnológico**](#4-stack-tecnológico)
5.  [**Estrutura do Projeto**](#5-estrutura-do-projeto)
6.  [**Banco de Dados**](#6-banco-de-dados)
7.  [**Endpoints da API**](#7-endpoints-da-api)
8.  [**Configuração e Variáveis de Ambiente**](#8-configuração-e-variáveis-de-ambiente)
9.  [**Guia de Instalação Local**](#9-guia-de-instalação-local)
10. [**Guia de Deploy (Coolify)**](#10-guia-de-deploy-coolify)
11. [**Análise de Problemas e Recomendações**](#11-análise-de-problemas-e-recomendações)
12. [**Licença**](#12-licença)

---

## 1. Visão Geral

O projeto é um sistema de gerenciamento de perfis no estilo "OnlyFans", permitindo que criadores de conteúdo configurem uma página de perfil dinâmica, gerenciem informações e aceitem pagamentos de assinaturas através da integração com o Stripe.

O sistema é composto por duas aplicações principais:

*   **Aplicação Principal (Backend Flask)**: Serve as páginas do site, gerencia a API para o CRUD de perfis, autenticação de administrador e atua como um proxy para o servidor de pagamentos.
*   **Servidor de Pagamentos (Backend Node.js)**: Orquestra a lógica de pagamento com o Stripe, incluindo a criação de sessões de checkout, cálculo de preços e o processamento de webhooks para confirmar assinaturas.

## 2. Funcionalidades

| Funcionalidade | Status | Descrição |
| :--- | :--- | :--- |
| **Perfis Dinâmicos** | ✅ **Implementado** | Perfis são carregados a partir do banco de dados, permitindo conteúdo 100% dinâmico. |
| **Painel Administrativo** | ✅ **Implementado** | Interface web para gerenciar todos os aspectos do perfil, incluindo textos, estatísticas e imagens. |
| **Autenticação de Admin** | ✅ **Implementado** | Proteção do painel administrativo com login e senha. |
| **Upload de Imagens** | ✅ **Implementado** | Funcionalidade para upload de foto de perfil e banner. |
| **Integração com Stripe** | ✅ **Implementado** | Sistema completo de checkout para assinaturas via Stripe. |
| **Cálculo de Planos** | ✅ **Implementado** | Descontos automáticos para planos de 6 e 12 meses. |
| **Processamento de Webhooks** | ✅ **Implementado** | Confirmação de pagamentos e atualização do status da assinatura via webhooks do Stripe. |
| **Persistência de Dados** | ⚠️ **Problema Crítico** | O banco de dados não está configurado para persistir entre reinicializações no ambiente de produção. |
| **Gerenciamento Multi-perfil** | ✅ **Implementado** | O painel de admin permite visualizar e gerenciar múltiplos perfis. |
| **Tema Claro/Escuro** | ✅ **Implementado** | O painel de admin possui um seletor de tema para melhor usabilidade. |

## 3. Arquitetura do Sistema

A arquitetura é baseada em microserviços, com uma clara separação de responsabilidades entre a aplicação principal e o serviço de pagamentos. Ambos são containerizados com Docker e orquestrados via `docker-compose.yml` para desenvolvimento e Coolify para produção.

```mermaid
graph TD
    subgraph "Usuário Final"
        A[Navegador Web] -->|Acessa o site| B{Flask App}
    end

    subgraph "Infraestrutura (Coolify/VPS)"
        B -- Clica em Assinar --> D{Modal de Assinatura}
        D -- Seleciona Plano --> E{API Flask}
        E -- Proxy Request --> F{API Node.js (Payment Server)}
        F -- Cria Sessão --> G[Stripe API]
        G -- Retorna URL --> F
        F -- Retorna URL --> E
        E -- Retorna URL --> D
        D -- Redireciona --> A
        A -- Paga no Stripe --> G
        G -- Webhook --> F
        F -- Atualiza DB --> H[(SQLite DB)]
        B -- Carrega Dados --> H
    end

    subgraph "Administrador"
        I[Painel Admin] -->|Login/Edição| E
        E -- Salva no DB --> H
    end
```

## 4. Stack Tecnológico

| Componente | Tecnologia | Versão |
| :--- | :--- | :--- |
| **Backend Principal** | Flask (Python) | 3.1.1 |
| **Servidor de Pagamentos** | Node.js + Express | 20 (Node), 5.1.0 (Express) |
| **Banco de Dados** | SQLite | 3.x |
| **ORM** | SQLAlchemy | 2.0.41 |
| **Servidor WSGI** | Gunicorn | 21.2.0 |
| **Containerização** | Docker | - |
| **Orquestração** | Docker Compose / Coolify | - |
| **Frontend** | HTML5, CSS3, JavaScript | - |
| **Gateway de Pagamento** | Stripe API | 19.1.0 |

## 5. Estrutura do Projeto

```
/onlyfans-main
├── Dockerfile                # Define a imagem Docker para a aplicação Flask.
├── docker-compose.yml        # Orquestra os serviços de Flask e Node.js para dev.
├── DEPLOY_COOLIFY.md         # Instruções de deploy para o Coolify.
├── requirements.txt          # Dependências Python.
├── payment_server/           # Microserviço de pagamento.
│   ├── server.js             # Lógica do servidor Express e Stripe.
│   ├── package.json          # Dependências Node.js.
│   └── ...
└── src/                      # Aplicação principal Flask.
    ├── main.py               # Ponto de entrada, rotas principais e inicialização.
    ├── database/             # Diretório onde o banco de dados SQLite é armazenado.
    ├── models/               # Definições dos modelos de dados (SQLAlchemy).
    │   └── profile.py
    ├── routes/               # Blueprints para as rotas da API.
    │   ├── auth.py
    │   └── profile.py
    └── static/               # Arquivos de frontend (HTML, CSS, JS).
        ├── uploads/          # Imagens carregadas pelo admin.
        ├── admin.html        # Painel de administração.
        ├── index.html        # Página de perfil pública.
        └── ...
```

## 6. Banco de Dados

O sistema utiliza um único arquivo de banco de dados SQLite (`app.db`) que é compartilhado entre a aplicação Flask e o servidor de pagamentos Node.js. Ele contém três tabelas principais.

### Tabela `profile`
Armazena todas as informações do perfil do criador.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | Integer | Chave primária. |
| `username` | String | Nome de usuário único (ex: `babymatosa`). |
| `display_name` | String | Nome de exibição (ex: `Victoria Matosa`). |
| `bio` | Text | Biografia do perfil, suporta HTML. |
| `subscription_price` | Float | **Campo crítico**: Preço base mensal da assinatura em USD. |
| `...` | ... | Outros campos de estatísticas e imagens. |

### Tabela `admin`
Armazena as credenciais de acesso ao painel administrativo.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | Integer | Chave primária. |
| `username` | String | Nome de usuário do administrador. |
| `password` | String | Senha com hash (Werkzeug). |

### Tabela `subscriptions`
Criada e gerenciada pelo `payment_server` para rastrear as assinaturas.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | Integer | Chave primária. |
| `profile_username` | Text | Username do perfil assinado. |
| `customer_email` | Text | E-mail do assinante. |
| `stripe_session_id` | Text | ID da sessão de checkout do Stripe. |
| `status` | Text | Status da assinatura (`pending`, `active`, `cancelled`). |
| `expires_at` | Datetime | Data de expiração da assinatura. |
| `...` | ... | Outros campos de rastreamento. |

## 7. Endpoints da API

O sistema expõe uma API RESTful para gerenciar os dados. As rotas que exigem autenticação são protegidas e só podem ser acessadas pelo painel de admin.

### API Principal (Flask)

| Método | Rota | Descrição | Autenticação |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile/<username>` | Retorna os dados públicos de um perfil. | Nenhuma |
| `GET` | `/api/profiles` | Lista todos os perfis. | **Sim** |
| `PUT` | `/api/profiles/<id>` | Atualiza um perfil existente. | **Sim** |
| `POST` | `/api/upload` | Realiza o upload de uma imagem. | **Sim** |
| `POST` | `/api/login` | Autentica um administrador. | Nenhuma |
| `POST` | `/api/create-checkout-session` | (Proxy) Cria uma sessão de pagamento. | Nenhuma |

### API de Pagamentos (Node.js)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/create-checkout-session` | Cria uma sessão de checkout no Stripe. |
| `POST` | `/api/webhook` | Recebe eventos do Stripe para confirmar pagamentos. |
| `GET` | `/api/subscription-plans/<username>` | Calcula e retorna os preços dos planos. |

## 8. Configuração e Variáveis de Ambiente

As configurações são gerenciadas através de variáveis de ambiente, seguindo as melhores práticas do "Twelve-Factor App".

### Aplicação Flask (`.env`)

```bash
# Chave secreta para segurança da sessão Flask.
SECRET_KEY="uma-chave-secreta-muito-forte"

# URL completa do servidor de pagamentos.
PAYMENT_SERVER_URL="http://localhost:3000"

# Caminho para o arquivo do banco de dados (usado em produção com volumes).
DATABASE_PATH="/app/src/database/app.db"
```

### Servidor de Pagamentos (`payment_server/.env`)

```bash
# Chaves da API do Stripe (obtenha no seu dashboard Stripe).
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Segredo do Webhook para verificação de eventos.
STRIPE_WEBHOOK_SECRET="whsec_..."

# URL do frontend para redirecionamento após o pagamento.
FRONTEND_URL="http://localhost:5000"

# Porta do servidor Node.js.
PORT=3000
```

## 9. Guia de Instalação Local

Para executar o projeto localmente para desenvolvimento, use o Docker Compose.

**Pré-requisitos:**
*   Docker e Docker Compose instalados.
*   Credenciais do Stripe (podem ser as de teste).

**Passos:**

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd onlyfans-main
    ```

2.  **Configure as variáveis de ambiente:**
    *   Crie um arquivo `.env` na raiz do projeto e adicione as variáveis da aplicação Flask.
    *   Crie um arquivo `.env` dentro de `payment_server/` e adicione as variáveis do servidor de pagamentos.

3.  **Suba os containers:**
    ```bash
    docker-compose up --build
    ```

4.  **Acesse os serviços:**
    *   **Site Principal**: [http://localhost:5000](http://localhost:5000)
    *   **Painel Admin**: [http://localhost:5000/admin.html](http://localhost:5000/admin.html)
    *   **Credenciais Padrão**: `admin` / `admin123`

## 10. Guia de Deploy (Coolify)

O projeto está preparado para deploy na plataforma Coolify.

1.  **Fonte**: Configure seu repositório Git no Coolify.
2.  **Build**: O Coolify usará o `Dockerfile` para construir a imagem automaticamente.
3.  **Volumes**: **É CRÍTICO** configurar os volumes para persistir os dados:
    *   `/app/src/database` para o banco de dados.
    *   `/app/src/static/uploads` para as imagens.
4.  **Variáveis de Ambiente**: Adicione todas as variáveis de ambiente (Flask e Node.js) na interface do Coolify. Use as URLs de produção (ex: `https://seu-dominio.com`).
5.  **Webhook Stripe**: Configure o endpoint do webhook no seu dashboard Stripe para apontar para `https://<url-do-payment-server>/api/webhook`.
6.  **Deploy**: Inicie o deploy. O Coolify cuidará do build, deploy e configuração de SSL.

## 11. Análise de Problemas e Recomendações

Durante a análise, foram identificados pontos de melhoria e problemas que precisam de atenção.

### Problemas Críticos (Prioridade Alta)

*   **Persistência do Banco de Dados**: O `docker-compose.yml` e as instruções de deploy precisam garantir que o diretório `src/database` seja um volume persistente. **Sem isso, todos os dados serão perdidos a cada reinicialização do container.**
*   **Credenciais Hardcoded**: O usuário e senha padrão do admin (`admin`/`admin123`) e a `SECRET_KEY` do Flask estão fixos no código. Eles devem ser movidos para variáveis de ambiente para evitar exposição.
*   **Upload de Imagens em Produção**: O caminho de upload de arquivos pode não funcionar corretamente em um ambiente de produção sem a configuração de volume adequada. É necessário testar e validar o fluxo de upload após o deploy.

### Melhorias Recomendadas (Prioridade Média)

*   **Validação e Tratamento de Erros**: Adicionar validação mais robusta nos formulários (frontend) e tratamento de erros mais detalhado na API (backend) para melhorar a resiliência.
*   **Segurança da Autenticação**: Implementar *rate limiting* na rota de login para prevenir ataques de força bruta.
*   **Dashboard de Assinaturas**: Criar uma nova seção no painel de admin para listar assinantes, visualizar status e receita.

### Sugestões Futuras (Prioridade Baixa)

*   **Migração para um Banco de Dados mais Robusto**: Considerar a migração de SQLite para PostgreSQL ou MySQL para melhor escalabilidade e concorrência em produção.
*   **Testes Automatizados**: Implementar testes unitários e de integração para garantir a estabilidade do código e evitar regressões.
*   **Monitoramento e Logs**: Integrar um serviço de monitoramento de erros (como Sentry) e configurar logs estruturados para facilitar a depuração.

## 12. Licença

Este projeto é fornecido "como está", sem garantias de qualquer tipo. O uso é de sua inteira responsabilidade.

---

*Documentação gerada e analisada por Manus AI em 14/10/2025.*

