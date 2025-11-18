#!/bin/bash
set -e

echo "🚀 Iniciando aplicação OnlyFans Clone..."

# Criar diretórios necessários se não existirem
mkdir -p /app/src/database
mkdir -p /app/src/static/uploads

# Executar migrações do banco de dados
echo "🔄 Executando migrações do banco de dados..."
python3 /app/migrate_add_language.py || echo "⚠️ Migração não necessária ou já executada"

# Iniciar aplicação com Gunicorn
echo "✅ Iniciando servidor Gunicorn..."
exec gunicorn --workers 4 --bind 0.0.0.0:5000 --timeout 120 --access-logfile - --error-logfile - src.main:app
