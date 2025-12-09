#!/bin/bash

# Script pour gérer les environnements
# Usage: ./switch-env.sh [dev|prod]

ENV=$1

if [ "$ENV" = "dev" ]; then
    echo "🔄 Basculement vers environnement DÉVELOPPEMENT"

    # Backend
    cp backend/.env.development backend/.env

    # Frontend
    cp frontend/.env.development frontend/.env.local

    echo "✅ Environnement DEV configuré"

elif [ "$ENV" = "prod" ]; then
    echo "🔄 Basculement vers environnement PRODUCTION"

    # Backend
    cp backend/.env.production backend/.env

    # Frontend
    cp frontend/.env.production frontend/.env.local

    echo "✅ Environnement PROD configuré"

else
    echo "❌ Usage: $0 [dev|prod]"
    echo "   dev  - Environnement de développement"
    echo "   prod - Environnement de production"
    exit 1
fi