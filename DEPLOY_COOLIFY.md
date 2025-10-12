# Deploy no Coolify - OnlyFans Clone

## Pré-requisitos

1. Conta Stripe (https://dashboard.stripe.com)
2. Servidor com Coolify instalado
3. Domínio configurado (ex: 0nlyfaans.com)

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no Coolify:

### Flask (Aplicação Principal)
- `FLASK_ENV=production`
- `SECRET_KEY=sua-chave-secreta-aqui`
- `SITE_URL=https://0nlyfaans.com`
- `FRONTEND_URL=https://0nlyfaans.com`
- `PAYMENT_SERVER_URL=https://payment.0nlyfaans.com`
- `PORT=5000`

### Payment Server (Node.js)
- `STRIPE_SECRET_KEY=sk_live_...` (da sua conta Stripe)
- `STRIPE_PUBLISHABLE_KEY=pk_live_...` (da sua conta Stripe)
- `STRIPE_WEBHOOK_SECRET=whsec_...` (configurar webhook no Stripe)
- `NODE_ENV=production`

## Estrutura do Projeto

```
onlyfans_system/
├── src/                    # Código Flask
│   ├── main.py            # Aplicação principal
│   ├── models/            # Modelos do banco
│   ├── routes/            # Rotas da API
│   ├── static/            # Arquivos estáticos
│   └── database/          # Banco SQLite
├── payment_server/        # Servidor de pagamentos Node.js
│   ├── server.js          # API Stripe
│   └── package.json       # Dependências
├── Dockerfile             # Build do Flask
├── docker-compose.yml     # Orquestração
└── requirements.txt       # Dependências Python
```

## Passos para Deploy

### 1. Configurar Domínios no Coolify

- Aplicação principal: `https://0nlyfaans.com`
- Payment server: `https://payment.0nlyfaans.com` (ou subdomínio)

### 2. Configurar Variáveis de Ambiente

No painel do Coolify, adicione todas as variáveis listadas acima.

### 3. Deploy

O Coolify irá:
1. Clonar o repositório
2. Construir a imagem Docker
3. Iniciar os containers
4. Configurar SSL automático

### 4. Configurar Webhook do Stripe

1. Acesse: https://dashboard.stripe.com/webhooks
2. Adicione endpoint: `https://payment.0nlyfaans.com/webhook`
3. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copie o `STRIPE_WEBHOOK_SECRET` e adicione nas variáveis

### 5. Testar

1. Acesse `https://0nlyfaans.com`
2. Clique em "Subscribe"
3. Complete o pagamento de teste
4. Verifique se redirecionou para página de sucesso

## Credenciais Admin Padrão

- **URL**: https://0nlyfaans.com/login.html
- **Usuário**: admin
- **Senha**: admin123

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

## Troubleshooting

### Erro de conexão com Payment Server
- Verifique se `PAYMENT_SERVER_URL` está correto
- Confirme que o payment server está rodando

### Preços não aparecem
- Verifique as chaves do Stripe
- Confira os logs do payment server

### Banco de dados não criado
- Verifique permissões da pasta `src/database`
- Confirme que o volume está montado corretamente

## Suporte

Para problemas, verifique os logs no Coolify em:
- Logs > Application Logs
- Logs > Deployment Logs
