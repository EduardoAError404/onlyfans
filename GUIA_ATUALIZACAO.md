# 🔄 Guia de Atualização - Payment Server Externo

## 📌 O que mudou?

O **Payment Server** foi separado do projeto principal e agora está **hospedado nos servidores da Manus**. Isso resolve os problemas de comunicação entre os serviços e simplifica o deploy.

### Antes (Arquitetura Antiga)
```
Coolify VPS
├── Flask App (porta 5000)
└── Payment Server (porta 3000) ❌ Problemas de comunicação
```

### Agora (Arquitetura Nova)
```
Coolify VPS
└── Flask App (porta 5000) ✅

Servidores Manus
└── Payment Server (porta 3000) ✅ Hospedado externamente
```

## 🚀 Como fazer o redeploy

### Passo 1: Atualizar o repositório no GitHub

```bash
# No seu computador local
git add .
git commit -m "Atualização: Payment server externo"
git push origin main
```

### Passo 2: Configurar variáveis de ambiente no Coolify

Acesse o painel do Coolify e configure as seguintes variáveis:

```bash
PAYMENT_SERVER_URL=https://3000-iueh88sebpgtsvwl1znd6-b52cfc53.manusvm.computer
FLASK_ENV=production
SECRET_KEY=f8a3c9e7d2b1a4f6e9c8d7b3a2f1e4d9c8b7a6f5e4d3c2b1a9f8e7d6c5b4a3f2
DATABASE_PATH=/app/src/database/app.db
SITE_URL=https://0nlyfaans.com
FRONTEND_URL=https://0nlyfaans.com
PORT=5000
```

### Passo 3: Configurar volumes persistentes (CRÍTICO)

No Coolify, configure os volumes:

```
/app/src/database → /data/database
/app/src/static/uploads → /data/uploads
```

### Passo 4: Fazer redeploy

1. No Coolify, clique em **"Redeploy"**
2. Aguarde o build completar
3. Verifique os logs para confirmar que iniciou corretamente

### Passo 5: Testar o sistema

1. Acesse `https://0nlyfaans.com`
2. Clique em "Subscribe"
3. Verifique se o modal de pagamento abre
4. Teste um pagamento (use cartão de teste do Stripe)

## ✅ Checklist de Verificação

- [ ] Código atualizado no GitHub
- [ ] Variáveis de ambiente configuradas no Coolify
- [ ] Volumes persistentes configurados
- [ ] Redeploy realizado com sucesso
- [ ] Site carrega corretamente
- [ ] Botão de assinatura funciona
- [ ] Modal de pagamento abre
- [ ] Painel admin acessível

## 🔍 Testando a comunicação

Para verificar se o Flask está se comunicando com o Payment Server:

```bash
# Teste 1: Verificar se o payment server está online
curl https://3000-iueh88sebpgtsvwl1znd6-b52cfc53.manusvm.computer/health

# Deve retornar:
# {"status":"ok","message":"Payment server is running",...}

# Teste 2: Verificar planos de assinatura
curl https://0nlyfaans.com/api/subscription-plans/babymatosao

# Deve retornar os planos com preços calculados
```

## 🐛 Problemas Comuns

### Erro: "Cannot connect to payment server"

**Causa:** Variável `PAYMENT_SERVER_URL` não configurada ou incorreta

**Solução:**
```bash
# Verifique se a variável está configurada no Coolify:
PAYMENT_SERVER_URL=https://3000-iueh88sebpgtsvwl1znd6-b52cfc53.manusvm.computer
```

### Erro: "Database not found"

**Causa:** Volumes não configurados corretamente

**Solução:**
1. Configure os volumes no Coolify
2. Faça redeploy
3. O banco será criado automaticamente

### Botão "Subscribe" não funciona

**Causa:** JavaScript não está carregando ou erro de CORS

**Solução:**
1. Verifique o console do navegador (F12)
2. Verifique se `PAYMENT_SERVER_URL` está correto
3. Teste a URL do payment server diretamente

## 📊 Monitoramento

### Logs do Flask
```bash
# No Coolify, acesse:
Logs → Application Logs
```

### Logs do Payment Server
O payment server está hospedado na Manus e já está configurado. Se houver problemas, entre em contato.

## 🔐 Segurança

### Alterar credenciais do admin

1. Acesse `https://0nlyfaans.com/login.html`
2. Login: `admin` / `admin123`
3. No código, altere em `src/main.py`:

```python
default_admin = Admin(
    username='seu_novo_usuario',
    password=generate_password_hash('sua_nova_senha_forte')
)
```

### Alterar SECRET_KEY

Gere uma nova chave secreta:

```python
import secrets
print(secrets.token_hex(32))
```

Configure no Coolify:
```bash
SECRET_KEY=<sua_nova_chave>
```

## 📞 Suporte

- **Problemas com deploy:** Verifique logs do Coolify
- **Problemas com pagamentos:** Verifique dashboard do Stripe
- **Payment server offline:** Entre em contato (servidor está na Manus)

---

**Data da atualização:** 14/10/2025
**Versão:** 2.0

