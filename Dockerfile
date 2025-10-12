FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn python-dotenv

# Copiar o projeto
COPY . .

# Criar diretório do banco de dados se não existir
RUN mkdir -p src/database src/static/uploads

# Expor porta
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "--timeout", "120", "src.main:app"]
