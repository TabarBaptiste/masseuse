# Masseuse - Application de Réservation de Massage

Application web full-stack pour la réservation de séances de massage, avec gestion des disponibilités, réservations et avis clients.

## Architecture

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js + React + Tailwind CSS
- **Authentification**: JWT avec rôles (USER, PRO, ADMIN)

## Démarrage Rapide

### Prérequis

- Node.js 22+
- PostgreSQL 14+
- npm ou yarn

### Installation

#### Option A: Avec Docker (Recommandé)

##### 1. Démarrer PostgreSQL avec Docker

```bash
docker-compose up -d
```

Cela démarre une instance PostgreSQL sur le port 5432.

##### 2. Continuer avec la configuration Backend (étape 2 ci-dessous)

Utilisez cette chaîne de connexion dans votre `.env`:
```env
DATABASE_URL="postgresql://masseuse:masseuse@localhost:5432/masseuse?schema=public"
DIRECT_URL="postgresql://masseuse:masseuse@localhost:5432/masseuse?schema=public"
```

#### Option B: Sans Docker

##### 1. Installer et configurer PostgreSQL manuellement

Installez PostgreSQL et créez une base de données nommée `masseuse`.

#### Configuration commune

##### 1. Cloner le projet

```bash
git clone <repository-url>
cd masseuse
```

##### 2. Configuration Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` basé sur `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/masseuse?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/masseuse?schema=public"

JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

PORT=3001
NODE_ENV=development
```

Générer le client Prisma et initialiser la base de données:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Démarrer le serveur backend:

```bash
npm run start:dev
```

Le backend sera disponible sur `http://localhost:3001`

##### 3. Configuration Frontend

```bash
cd ../frontend
npm install
```

Créer un fichier `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Démarrer le serveur frontend:

```bash
npm run dev
```

Le frontend sera disponible sur `http://localhost:3000`

## Comptes de Test

Après l'exécution du seed, vous aurez accès aux comptes suivants:

- **Admin**: admin@masseuse.com / Admin123!
- **PRO**: pro@masseuse.com / Pro123!

Vous pouvez également créer un compte client via l'interface d'inscription.

## Fonctionnalités

### Côté Client (USER)
- ✅ Parcourir les services de massage
- ✅ Consulter les détails d'un service
- ✅ Réserver un créneau disponible
- ✅ Voir ses réservations
- ✅ Annuler une réservation
- ✅ Laisser un avis après une séance

### Côté Professionnel (PRO)
- ✅ Gérer les services (créer, modifier, désactiver)
- ✅ Définir les disponibilités hebdomadaires
- ✅ Bloquer des créneaux spécifiques
- ✅ Voir toutes les réservations
- ✅ Modifier le statut des réservations
- ✅ Approuver/refuser les avis clients

### Côté Administration (ADMIN)
- ✅ Gérer les utilisateurs
- ✅ Modérer les avis
- ✅ Configurer les paramètres du site
- ✅ Accès complet à toutes les fonctionnalités

## Structure du Projet

```
masseuse/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Schéma de base de données
│   │   └── seed.ts            # Données initiales
│   └── src/
│       ├── auth/              # Module d'authentification
│       ├── users/             # Gestion des utilisateurs
│       ├── services/          # Services de massage
│       ├── availability/      # Disponibilités hebdomadaires
│       ├── blocked-slots/     # Créneaux bloqués
│       ├── bookings/          # Réservations
│       ├── reviews/           # Avis clients
│       └── site-settings/     # Paramètres du site
└── frontend/
    ├── app/                   # Pages Next.js
    ├── components/            # Composants réutilisables
    ├── lib/                   # Utilitaires
    ├── store/                 # State management (Zustand)
    └── types/                 # Types TypeScript
```

## Scripts Disponibles

### Backend

```bash
npm run start:dev          # Développement avec hot-reload
npm run build             # Build production
npm run start:prod        # Démarrer en production
npm run prisma:generate   # Générer le client Prisma
npm run prisma:migrate    # Exécuter les migrations
npm run prisma:seed       # Remplir la base avec des données
npm run prisma:studio     # Interface graphique Prisma
npm run lint              # Linter le code
npm run test              # Lancer les tests
```

### Frontend

```bash
npm run dev               # Développement avec hot-reload
npm run build             # Build production
npm run start             # Démarrer en production
npm run lint              # Linter le code
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Services
- `GET /api/services` - Liste des services
- `GET /api/services/:id` - Détails d'un service
- `POST /api/services` - Créer un service (PRO/ADMIN)
- `PATCH /api/services/:id` - Modifier un service (PRO/ADMIN)
- `DELETE /api/services/:id` - Supprimer un service (ADMIN)

### Bookings
- `GET /api/bookings/available-slots` - Créneaux disponibles
- `POST /api/bookings` - Créer une réservation
- `GET /api/bookings/my-bookings` - Mes réservations
- `GET /api/bookings` - Toutes les réservations (PRO/ADMIN)
- `PATCH /api/bookings/:id` - Modifier une réservation
- `POST /api/bookings/:id/cancel` - Annuler une réservation

## Sécurité

- Mots de passe hashés avec bcrypt
- Authentification JWT
- Guards basés sur les rôles
- Validation des données côté serveur
- Protection CORS

## Licence

Private - Tous droits réservés
