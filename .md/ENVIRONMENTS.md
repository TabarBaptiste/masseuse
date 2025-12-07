# Guide des environnements
# =========================

## Architecture
- **DEV** : Branche `develop` → Netlify DEV → Render DEV → Supabase DEV
- **PROD** : Branche `main` → Netlify PROD → Render PROD → Supabase PROD

## Configuration requise

### 1. Supabase
Créer 2 projets :
- `masseuse-dev` (développement)
- `masseuse-prod` (production)

Pour chaque projet :
- Copier DATABASE_URL et DIRECT_URL
- Exécuter les migrations Prisma

### 2. Render
Créer 2 services :
- `masseuse-backend-dev` (branche: develop)
- `masseuse-backend-prod` (branche: main)

Variables d'environnement pour chaque service :
- DATABASE_URL
- DIRECT_URL
- JWT_SECRET
- FRONTEND_URL

### 3. Netlify
Créer 2 sites :
- `masseuse-dev.netlify.app` (branche: develop)
- `masseuse-prod.netlify.app` (branche: main)

Variable d'environnement pour chaque site :
- NEXT_PUBLIC_API_URL

## Workflow de développement

### Développement local
```bash
# Basculer vers DEV
./switch-env.sh dev

# Démarrer les services
cd backend && npm run start:dev
cd ../frontend && npm run dev
```

### Déploiement
```bash
# Push vers develop (déclenche déploiement DEV)
git checkout develop
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin develop

# Merge vers main (déclenche déploiement PROD)
git checkout main
git merge develop
git push origin main
```

## Sécurité
- ❌ NE PAS committer les fichiers .env
- ❌ NE PAS partager les secrets
- ✅ Utiliser des mots de passe forts
- ✅ Régénérer les JWT secrets pour la prod