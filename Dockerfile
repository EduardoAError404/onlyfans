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
COPY payment_server ./payment_server

# Criar diretórios necessários
RUN mkdir -p src/database src/static/uploads

# Expor porta
EXPOSE 5000

# Healthcheck para o Coolify
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Comando para iniciar
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "src.main:app"]

