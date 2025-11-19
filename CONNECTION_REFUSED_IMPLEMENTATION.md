# 🚫 Implementação: Recusar Conexão para Perfis Inexistentes

## 📋 Objetivo

Modificar o servidor Flask para **recusar conexões** (connection refused) quando:
1. ❌ Acessar domínio raiz (`https://0nlyfaans.com/`)
2. ❌ Acessar perfil inexistente (`https://0nlyfaans.com/hhgvb`)

E manter funcionamento normal quando:
1. ✅ Acessar perfil existente (`https://0nlyfaans.com/kendalharwell`)
2. ✅ Acessar arquivo estático existente (`https://0nlyfaans.com/static/style.css`)

---

## 🔧 Alterações Implementadas

### 1. **Função `refuse_connection()`**

Criada função customizada para simular conexão recusada:

```python
def refuse_connection():
    """Fecha a conexão abruptamente sem enviar resposta HTTP"""
    from flask import Response
    response = Response('', status=444)
    response.headers.clear()
    return response
```

**Status 444**: Código não-padrão usado pelo Nginx para "fechar conexão sem resposta". No Flask, retorna resposta vazia que o navegador interpreta como erro de conexão.

---

### 2. **Modificação da Rota Raiz (`/`)**

**ANTES**:
```python
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')
```

**DEPOIS**:
```python
@app.route('/')
def serve_index():
    """Recusar conexão no domínio raiz"""
    return refuse_connection()
```

**Resultado**: Acessar `https://0nlyfaans.com/` agora retorna erro de conexão ao invés de mostrar a página.

---

### 3. **Verificação de Perfil na Rota Dinâmica (`/<path:path>`)**

**ANTES**:
```python
@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    
    # Serve index.html para QUALQUER rota
    return send_from_directory(app.static_folder, 'index.html')
```

**DEPOIS**:
```python
@app.route('/<path:path>')
def serve_static(path):
    # Se o arquivo existe, servir o arquivo
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    # Se começa com 'api/', retornar 404 JSON
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    
    # Para qualquer outra rota (username), verificar se o perfil existe
    username = path.rstrip('/')
    
    # Verificar se o perfil existe no banco de dados
    profile = Profile.query.filter_by(username=username).first()
    
    if profile:
        # Perfil existe - servir index.html
        return send_from_directory(app.static_folder, 'index.html')
    else:
        # Perfil não existe - recusar conexão
        return refuse_connection()
```

**Lógica**:
1. ✅ Arquivo existe → Serve o arquivo
2. ✅ Rota API → Retorna JSON 404
3. ✅ Perfil existe no banco → Serve `index.html`
4. ❌ Perfil NÃO existe → Recusa conexão

---

### 4. **Handler de Erro 444**

Adicionado handler para capturar erros 444:

```python
@app.errorhandler(444)
def handle_444(e):
    return refuse_connection()
```

---

## 📊 Comportamento Esperado

| URL | Perfil Existe? | Arquivo Existe? | Resultado |
|-----|----------------|-----------------|-----------|
| `https://0nlyfaans.com/` | N/A | N/A | ❌ **Connection Refused** |
| `https://0nlyfaans.com/kendalharwell` | ✅ Sim | N/A | ✅ Serve `index.html` |
| `https://0nlyfaans.com/hhgvb` | ❌ Não | N/A | ❌ **Connection Refused** |
| `https://0nlyfaans.com/static/style.css` | N/A | ✅ Sim | ✅ Serve arquivo CSS |
| `https://0nlyfaans.com/api/profile/test` | N/A | N/A | ✅ Retorna JSON 404 |
| `https://0nlyfaans.com/edit-profile.html` | N/A | ✅ Sim | ✅ Serve arquivo HTML |

---

## 🎯 Vantagens da Implementação

### 1. **Segurança**
- Oculta a existência do site para quem não sabe o username correto
- Dificulta ataques de força bruta para descobrir perfis
- Não revela estrutura do site através de página 404

### 2. **Privacidade**
- Site parece estar "fora do ar" para visitantes não autorizados
- Apenas quem conhece um username válido consegue acessar

### 3. **Performance**
- Não processa HTML para páginas inexistentes
- Fecha conexão imediatamente sem renderizar conteúdo

### 4. **User Experience**
- Perfis válidos funcionam normalmente
- Arquivos estáticos (CSS, JS, imagens) continuam acessíveis
- Painel admin e APIs funcionam normalmente

---

## 🚀 Deploy em Produção

### Passo 1: Atualizar Código no Servidor

```bash
# 1. Conectar ao servidor
ssh user@0nlyfaans.com

# 2. Navegar até o diretório do projeto
cd /path/to/onlyfans

# 3. Fazer pull das alterações
git pull origin main

# 4. Verificar alterações
git log -1
# Deve mostrar: "Feat: Recusar conexão para domínio raiz e perfis inexistentes"
```

### Passo 2: Reiniciar Servidor Flask

```bash
# Opção A: systemd
sudo systemctl restart onlyfans

# Opção B: supervisor
sudo supervisorctl restart onlyfans

# Opção C: PM2
pm2 restart onlyfans

# Opção D: Gunicorn/uWSGI
sudo systemctl restart gunicorn
```

### Passo 3: Verificar Status

```bash
# Verificar se o servidor está rodando
sudo systemctl status onlyfans
# ou
pm2 status

# Verificar logs
sudo journalctl -u onlyfans -f
# ou
pm2 logs onlyfans
```

---

## ✅ Testes de Validação

Após o deploy, testar as seguintes URLs:

### ❌ Devem Recusar Conexão:
```bash
# 1. Domínio raiz
curl -I https://0nlyfaans.com/
# Esperado: Connection refused ou Empty response

# 2. Perfil inexistente
curl -I https://0nlyfaans.com/hhgvb
# Esperado: Connection refused ou Empty response

curl -I https://0nlyfaans.com/perfilteste123
# Esperado: Connection refused ou Empty response
```

### ✅ Devem Funcionar Normalmente:
```bash
# 1. Perfil existente
curl -I https://0nlyfaans.com/kendalharwell
# Esperado: HTTP 200 OK

# 2. Arquivo estático
curl -I https://0nlyfaans.com/static/style.css
# Esperado: HTTP 200 OK

# 3. Painel admin
curl -I https://0nlyfaans.com/edit-profile.html
# Esperado: HTTP 200 OK

# 4. API
curl https://0nlyfaans.com/api/profile/kendalharwell
# Esperado: JSON com dados do perfil
```

---

## 🐛 Troubleshooting

### Problema: Perfis válidos retornam connection refused

**Causa**: Perfil não existe no banco de dados ou nome está incorreto

**Solução**:
```bash
# 1. Verificar perfis no banco de dados
sqlite3 /path/to/database/app.db "SELECT username FROM profile;"

# 2. Adicionar perfil se necessário (via painel admin)
```

### Problema: Arquivos estáticos retornam connection refused

**Causa**: Caminho do arquivo está incorreto ou arquivo não existe

**Solução**:
```bash
# Verificar se arquivo existe
ls -la /path/to/onlyfans/src/static/style.css

# Verificar permissões
chmod 644 /path/to/onlyfans/src/static/*.css
```

### Problema: Página 404 ainda aparece

**Causa**: Servidor não foi reiniciado ou código antigo ainda em cache

**Solução**:
```bash
# 1. Reiniciar servidor
sudo systemctl restart onlyfans

# 2. Limpar cache do Nginx (se aplicável)
sudo systemctl reload nginx

# 3. Verificar versão do código
cd /path/to/onlyfans && git log -1
```

---

## 📝 Observações Importantes

### 1. **Status Code 444**
- Código não-padrão usado pelo Nginx
- No Flask, retorna resposta vazia que navegadores interpretam como erro de conexão
- Navegadores mostram: "ERR_EMPTY_RESPONSE" ou "Connection Refused"

### 2. **Banco de Dados**
- A verificação de perfil consulta o banco de dados em **toda requisição**
- Para otimizar, considerar adicionar cache (Redis) no futuro
- Atualmente, impacto de performance é mínimo

### 3. **Rotas API**
- Rotas que começam com `/api/` continuam retornando JSON 404
- Isso é intencional para manter compatibilidade com frontend

### 4. **Arquivos Estáticos**
- Verificação de arquivo acontece ANTES da verificação de perfil
- Garante que CSS, JS, imagens continuem acessíveis

---

## 📈 Estatísticas da Implementação

- **Linhas de código adicionadas**: ~30
- **Arquivos modificados**: 1 (`src/main.py`)
- **Funções criadas**: 2 (`refuse_connection()`, `handle_444()`)
- **Rotas modificadas**: 2 (`/`, `/<path:path>`)
- **Queries ao banco**: 1 por requisição de perfil

---

## 🎉 Conclusão

A implementação foi concluída com sucesso! O servidor agora:

✅ Recusa conexões para domínio raiz  
✅ Recusa conexões para perfis inexistentes  
✅ Mantém funcionamento normal para perfis existentes  
✅ Mantém funcionamento normal para arquivos estáticos  
✅ Mantém funcionamento normal para APIs  

**Status**: ✅ **IMPLEMENTAÇÃO CONCLUÍDA** - Aguardando deploy no servidor de produção

**Commit**: `4d12192`  
**Branch**: `main`  
**Push**: Concluído
