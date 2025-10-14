# 🚀 Deploy no Coolify - OnlyFans Clone

## ⚠️ IMPORTANTE - MUDANÇAS NA ARQUITETURA

O **Payment Server agora está hospedado externamente** nos servidores da Manus. Você **NÃO precisa mais** hospedar o servidor de pagamentos no seu Coolify.

**URL do Payment Server (Manus):**
```
https://3000-iueh88sebpgtsvwl1znd6-b52cfc53.manusvm.computer
```

## 📋 Pré-requisitos

1. ✅ Servidor com Coolify instalado
2. ✅ Domínio configurado (ex: 0nlyfaans.com)
3. ✅ Conta Stripe (as chaves já estão configuradas no payment server)

## 🔧 Variáveis de Ambiente Necessárias

Configure **APENAS** as seguintes variáveis no Coolify:

```bash
# Payment Server (Hospedado na Manus - NÃO ALTERAR)
PAYMENT_SERVER_URL=https://3000-iueh88sebpgtsvwl1znd6-b52cfc53.manusvm.computer

# Configuração do Flask
FLASK_ENV=production
SECRET_KEY=f8a3c9e7d2b1a4f6e9c8d7b3a2f1e4d9c8b7a6f5e4d3c2b1a9f8e7d6c5b4a3f2
DATABASE_PATH=/app/src/database/app.db

# URLs do seu site
SITE_URL=https://0nlyfaans.com
FRONTEND_URL=https://0nlyfaans.com

# Porta
PORT=5000
```

## 📦 Estrutura do Projeto (Simplificada)

```
onlyfans-main/
├── src/                    # Código Flask
│   ├── main.py            # Aplicação principal
│   ├── models/            # Modelos do banco
│   ├── routes/            # Rotas da API
│   ├── static/            # Arquivos estáticos
│   └── database/          # Banco SQLite (VOLUME PERSISTENTE)
├── Dockerfile             # Build do Flask
└── requirements.txt       # Dependências Python
```

**NOTA:** A pasta `payment_server/` foi removida do projeto pois agora está hospedada externamente.

## 🚀 Passos para Deploy

### 1. Configurar Repositório no Coolify

1. Acesse seu Coolify
2. Crie um novo projeto
3. Configure o repositório Git
4. Branch: `main` ou `master`

### 2. Configurar Variáveis de Ambiente

No painel do Coolify, adicione **todas** as variáveis listadas acima na seção "Environment Variables".

### 3. ⚠️ CRÍTICO - Configurar Volumes Persistentes

**MUITO IMPORTANTE:** Configure os volumes para evitar perda de dados:

```
/app/src/database:/data/database
/app/src/static/uploads:/data/uploads
```

Ou no formato do Coolify:
- **Source:** `/data/database` → **Destination:** `/app/src/database`
- **Source:** `/data/uploads` → **Destination:** `/app/src/static/uploads`

### 4. Configurar Domínio

- Domínio principal: `https://0nlyfaans.com`
- O Coolify configurará SSL automático via Let's Encrypt

### 5. Fazer Deploy

1. Clique em "Deploy"
2. O Coolify irá:
   - Clonar o repositório
   - Construir a imagem Docker
   - Iniciar o container
   - Configurar SSL automático

### 6. Verificar Funcionamento

1. Acesse `https://0nlyfaans.com`
2. Verifique se a página carrega
3. Teste o botão "Subscribe"
4. Verifique se o checkout do Stripe abre

## 🔐 Credenciais Admin Padrão

- **URL:** https://0nlyfaans.com/login.html
- **Usuário:** admin
- **Senha:** admin123

⚠️ **ALTERE A SENHA** após o primeiro login!

## 🎯 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────┐
│                   Coolify (VPS)                     │
│  ┌──────────────────────────────────────────────┐   │
│  │         Flask App (0nlyfaans.com)            │   │
│  │         - Porta 5000                         │   │
│  │         - API REST                           │   │
│  │         - Páginas estáticas                  │   │
│  │         - Banco de dados SQLite              │   │
│  └────────────────┬─────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                    │
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────────┐
│              Servidores Manus                       │
│  ┌──────────────────────────────────────────────┐   │
│  │     Payment Server (Node.js + Stripe)        │   │
│  │     - Porta 3000                             │   │
│  │     - Integração Stripe                      │   │
│  │     - Cálculo de preços                      │   │
│  │     - Webhooks                               │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to payment server"

**Solução:** Verifique se a variável `PAYMENT_SERVER_URL` está configurada corretamente:
```
PAYMENT_SERVER_URL=https://3000-iueh88sebpgtsvwl1znd6-b52cfc53.manusvm.computer
```

### Banco de dados não persiste

**Solução:** Verifique se os volumes estão configurados corretamente no Coolify.

### Upload de imagens não funciona

**Solução:** 
1. Verifique se o volume `/app/src/static/uploads` está configurado
2. Verifique permissões da pasta no container

### Preços não aparecem

**Solução:** 
1. Verifique se o payment server está acessível
2. Teste: `curl https://3000-iueh88sebpgtsvwl1znd6-b52cfc53.manusvm.computer/health`
3. Deve retornar: `{"status":"ok"}`

## 📊 Logs

Para verificar logs no Coolify:
1. Acesse o projeto
2. Clique em "Logs"
3. Selecione "Application Logs" ou "Deployment Logs"

## 🔄 Atualizar o Projeto

Para atualizar após fazer mudanças:
1. Faça commit e push para o GitHub
2. No Coolify, clique em "Redeploy"
3. Aguarde o build e deploy

## 📞 Suporte

Para problemas com:
- **Hospedagem/Coolify:** Verifique logs do Coolify
- **Payment Server:** O servidor está hospedado na Manus e já está configurado
- **Stripe:** Verifique o dashboard do Stripe

---

**Última atualização:** 14/10/2025
**Versão:** 2.0 (Payment Server Externo)

