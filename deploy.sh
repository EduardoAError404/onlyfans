#!/bin/bash

echo "🚀 OnlyFans Clone - Deploy Script"
echo "=================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Erro: Dockerfile não encontrado!${NC}"
    echo "Execute este script no diretório do projeto."
    exit 1
fi

echo -e "${YELLOW}📦 Preparando ambiente...${NC}"

# Criar diretórios necessários
mkdir -p src/database src/static/uploads

# Verificar variáveis de ambiente
echo -e "${YELLOW}🔍 Verificando variáveis de ambiente...${NC}"

REQUIRED_VARS=("STRIPE_SECRET_KEY" "STRIPE_PUBLISHABLE_KEY" "FRONTEND_URL")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Variáveis de ambiente faltando:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Configure as variáveis no Coolify antes de fazer deploy."
    exit 1
fi

echo -e "${GREEN}✅ Todas as variáveis necessárias estão configuradas!${NC}"
echo ""

# Informações do deploy
echo -e "${GREEN}📋 Informações do Deploy:${NC}"
echo "   - Frontend URL: ${FRONTEND_URL:-não configurado}"
echo "   - Payment Server URL: ${PAYMENT_SERVER_URL:-http://localhost:3000}"
echo "   - Flask ENV: ${FLASK_ENV:-production}"
echo ""

echo -e "${GREEN}✅ Projeto pronto para deploy!${NC}"
echo ""
echo "O Coolify irá:"
echo "  1. Construir a imagem Docker"
echo "  2. Inicializar o banco de dados"
echo "  3. Iniciar a aplicação Flask"
echo "  4. Configurar SSL automático"
echo ""
echo -e "${YELLOW}⚠️  Lembre-se de configurar o Payment Server separadamente!${NC}"
