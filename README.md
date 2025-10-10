# 🎯 Sistema OnlyFans Dinâmico

Sistema completo de gerenciamento de perfil OnlyFans com banco de dados SQLite, backend Flask e painel administrativo.

## 📋 Características

- ✅ **Página principal dinâmica** - Todos os dados são carregados do banco de dados
- ✅ **Painel administrativo** - Interface intuitiva para editar todas as informações
- ✅ **Banco de dados SQLite** - Configurado e pronto para uso
- ✅ **API RESTful** - Backend Flask com autenticação
- ✅ **Sistema de login** - Proteção do painel administrativo
- ✅ **Responsivo** - Funciona em desktop e mobile

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
python3 -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Executar o Servidor

```bash
python src/main.py
```

O servidor estará disponível em: http://localhost:5000

### 3. Acessar o Painel Administrativo

URL: http://localhost:5000/admin.html

**Credenciais padrão**:
- Usuário: `admin`
- Senha: `admin123`

⚠️ **IMPORTANTE**: Altere as credenciais antes de colocar em produção!

## 📁 Estrutura do Projeto

```
onlyfans_system/
├── src/
│   ├── main.py              # Arquivo principal
│   ├── database/
│   │   └── app.db          # Banco de dados SQLite
│   ├── models/
│   │   ├── profile.py      # Modelo de dados
│   │   └── user.py
│   ├── routes/
│   │   ├── profile.py      # Rotas da API
│   │   └── user.py
│   └── static/
│       ├── index.html      # Página principal
│       ├── admin.html      # Painel admin
│       └── ...
└── requirements.txt
```

## 🔧 Configuração

### Alterar Credenciais do Admin

Edite `src/main.py` na função `init_database()`:

```python
default_admin = Admin(
    username='seu_usuario',
    password=generate_password_hash('sua_senha')
)
```

### Alterar SECRET_KEY

No arquivo `src/main.py`:

```python
app.config['SECRET_KEY'] = 'sua-chave-secreta-aqui'
```

## 📝 API Endpoints

### GET /api/profile
Retorna os dados do perfil

### PUT /api/profile
Atualiza os dados do perfil (requer autenticação)

### POST /api/login
Faz login no sistema

### POST /api/logout
Faz logout do sistema

### GET /api/check-auth
Verifica se o usuário está autenticado

## 🎨 Campos Editáveis

- Nome de exibição
- Nome de usuário (@username)
- Biografia (com suporte a HTML)
- Localização
- Link externo
- Quantidade de fotos
- Quantidade de vídeos
- Quantidade de likes
- Quantidade de posts
- Quantidade de mídia total

## 🔒 Segurança

- Senhas criptografadas com hash
- Sessões seguras
- Proteção contra acesso não autorizado
- CORS configurado

## 📦 Dependências

- Flask
- Flask-SQLAlchemy
- Flask-CORS
- Werkzeug

## 📖 Documentação Adicional

- `GUIA_DE_HOSPEDAGEM.md` - Guia completo de como hospedar o sistema
- `INSTRUCOES_SISTEMA.md` - Instruções detalhadas de uso

## 🆘 Suporte

Se encontrar algum problema ou tiver dúvidas, consulte a documentação ou entre em contato.

## 📄 Licença

Este projeto é fornecido como está, sem garantias.

---

**Desenvolvido com ❤️**

