# Multi-stage build para OnlyFans Clone
FROM python:3.11-slim as python-base

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY src ./src

# Copiar scripts de migração e entrypoint
COPY migrate_add_language.py ./
COPY migrate_add_thumbnails.py ./
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh migrate_add_language.py migrate_add_thumbnails.py

# Criar diretórios necessários
RUN mkdir -p src/database src/static/uploads

# Expor porta
EXPOSE 5000

# Healthcheck para o Coolify
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Comando para iniciar (usa entrypoint para executar migrações)
CMD ["./entrypoint.sh"]

