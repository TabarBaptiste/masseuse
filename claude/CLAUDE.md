# CLAUDE.md — Contexte Projet

> Ce fichier m'est destiné (Claude). Il me permet de comprendre l'intégralité du projet en une seule lecture.
> Il doit être maintenu à jour à chaque modification significative du projet.
> Dernière mise à jour : 2026-03-20

---

## 1. Vue d'ensemble

| Champ          | Valeur                                                               |
|----------------|----------------------------------------------------------------------|
| Nom du projet  | Jeu-concours Thé Tip Top                                             |
| Description    | Site web dédié au jeu-concours pour l'ouverture de la 10ème boutique |
| Statut         | En développement                                                     |
| Client         | Thé Tip Top — M. Eric Bourdon (gérant)                               |
| Agence         | Furious Ducks                                                        |
| Équipe         | Baptiste, Harena, Ibrahima                                           |
| Démarré le     | 2025                                                                 |

### Objectif principal
Permettre aux clients de Thé Tip Top de participer à un jeu-concours en soumettant le code présent sur leur ticket de caisse (achat ≥ 49€). 100% des tickets sont gagnants. Un grand prix (1 an de thé, 360€) est tiré au sort en fin de jeu parmi tous les participants.

### Ce que l'application NE fait PAS
- Ce n'est PAS le site e-commerce de Thé Tip Top (refait par une autre agence).
- Elle ne génère pas les codes en temps réel : les 500 000 codes sont **pré-générés** avant le début du jeu avec leur lot déjà associé.
- Elle ne gère pas la caisse en boutique (elle s'y connecte via API).

---

## 2. Stack technique

| Couche          | Technologie / Lib              | Version | Remarques                                 |
|-----------------|--------------------------------|---------|-------------------------------------------|
| Runtime         | Node.js                        | —       | —                                         |
| Framework back  | NestJS                         | 10      | TypeScript natif, modulaire               |
| Langage         | TypeScript                     | —       | Full-stack TS (front + back)              |
| Base de données | PostgreSQL                     | 16      | ACID, JSONB, index composites             |
| ORM             | Prisma                         | —       | Types auto-générés, migrations intuitives |
| Auth            | Passport.js                    | —       | JWT + OAuth2 Google/Facebook              |
| Cache           | Redis                          | —       | Stats, sessions, rate limiting, queues    |
| API Doc         | Swagger / OpenAPI              | —       | Généré depuis NestJS                      |
| Framework front | Next.js (App Router)           | 14      | SSR/SSG, Server Components                |
| Styling         | TailwindCSS + Shadcn/ui        | —       | —                                         |
| État global     | Zustand                        | —       | —                                         |
| Data fetching   | React Query                    | —       | —                                         |
| Formulaires     | React Hook Form + Zod          | —       | Validation côté client                    |
| Tests unitaires | Jest                           | —       | Intégré à NestJS                          |
| Tests E2E       | Playwright (ou Cypress)        | —       | + Postman/Newman pour API                 |
| Tests perf      | K6 (Grafana K6)                | —       | Simulation de montée en charge            |
| Qualité code    | SonarQube Community Edition    | —       | Quality gates obligatoires                |
| Conteneurs      | Docker + Docker Compose        | —       | Env de dev et prod identiques             |
| Reverse Proxy   | Traefik                        | —       | SSL Let's Encrypt automatique             |
| CI/CD           | Jenkins                        | —       | Workflow Furious Ducks                    |
| Monitoring      | Prometheus + Grafana           | —       | Visualisation K6 incluse                  |
| Emailing        | Brevo (ex-Sendinblue)          | —       | Transactionnel + marketing                |
| Analytics       | Google Analytics               | —       | Événements : inscription, ticket, remise  |
| Hébergement     | OVHcloud Public Cloud          | —       | Europe, RGPD, 4-8 vCPU, 8-16 Go RAM      |

---

## 3. Architecture & Structure des fichiers

```
<!-- À compléter une fois le projet initialisé avec : tree -L 3 --gitignore -->
```

### Domaine & URLs
- Site principal Thé Tip Top : `www.thetiptop.fr` (hors scope — autre agence)
- Jeu-concours : `jeu.thetiptop.fr`

### Séparation API / WebApp
L'application est composée de **deux projets distincts** :
- `api/` → NestJS (backend REST)
- `webapp/` → Next.js 14 (frontend)

L'API communique avec :
1. La webapp jeu-concours
2. Les caisses en magasin
3. Le futur site de vente en ligne

---

## 4. Modèle de données

```
GAME_CONFIG ──< TICKETS >──── PRIZES
                  │
                  └──< PARTICIPATIONS >── LEADS >── USERS
                                              │
                                         GRAND_PRIZE_DRAW

ORDERS >── USERS
  │
  └──< ORDER_ITEMS >── PRODUCTS
```

### Entités principales

| Table             | PK                        | Description                                                                                           |
|-------------------|---------------------------|-------------------------------------------------------------------------------------------------------|
| `USERS`           | `user_id` SERIAL          | Comptes authentifiés. Rôles : `client`, `admin`, `employee`. Mot de passe haché (algo renforcé).      |
| `LEADS`           | `lead_id` SERIAL          | Participants au jeu (pas forcément un compte). Lien optionnel vers USERS. Consentement RGPD NOT NULL. |
| `GAME_CONFIG`     | `game_id` SERIAL          | Config du jeu : dates début/fin, max tickets, état actif. Extensible pour futures éditions.           |
| `PRIZES`          | `prize_id` SERIAL         | Lots avec pourcentage de distribution. Somme des % = 100 (contrainte applicative).                    |
| `TICKETS`         | `ticket_id` SERIAL        | 500 000 codes pré-générés. Index UNIQUE sur `code`. Colonnes `is_used` et `used_at`.                  |
| `PARTICIPATIONS`  | `participation_id` SERIAL | Lien TICKETS ↔ LEADS. 1 ticket = 1 participation (unicité). Référence employé remettant le lot.       |
| `GRAND_PRIZE_DRAW`| `draw_id` SERIAL          | Résultat du tirage grand prix : participant, horodatage, ID PV huissier. 1 ligne par jeu.             |
| `ORDERS`          | `order_id` SERIAL         | Commandes e-commerce (hors scope MVP, prévu API partenaire).                                          |
| `ORDER_ITEMS`     | `item_id` SERIAL          | Lignes de commande. Prix unitaire dénormalisé (snapshot au moment de la commande).                    |
| `PRODUCTS`        | `product_id` SERIAL       | Catalogue produits. Stock décrémenté atomiquement lors d'une commande (verrouillage ligne).           |

### Contraintes critiques
- `UNIQUE` : `LEADS.email` + `TICKETS.code`
- `NOT NULL` : consentement RGPD, email
- `FK ON DELETE RESTRICT` : GAME_CONFIG → TICKETS (pas de suppression config avec tickets associés)
- `FK ON DELETE CASCADE` : LEADS → PARTICIPATIONS (droit à l'oubli RGPD)
- `CHECK` : `prizes.percentage > 0 AND ≤ 100`
- Index composites : `(game_id, is_used)` sur TICKETS, `(lead_id, participated_at)` sur PARTICIPATIONS
- Isolation `SERIALIZABLE` recommandée pour la soumission de tickets

---

## 5. Flux & Logique métier

### Règles de gestion (RG)

| ID    | Règle                                                                                                 |
|-------|-------------------------------------------------------------------------------------------------------|
| RG-01 | Email unique par jeu — doublon traité en mode silencieux (RGPD, pas d'erreur affichée)                |
| RG-02 | Consentement RGPD obligatoire (checkbox + horodatage stocké en base)                                  |
| RG-03 | Protection anti-bot : honeypot + rate limiting côté serveur                                           |
| RG-04 | Synchronisation Brevo asynchrone (file d'attente) avec relance automatique toutes les 15 min          |
| RG-05 | Grand Prix : 1 participation par client quel que soit le nombre de tickets soumis (dédoublonnage)     |
| RG-10 | 500 000 codes pré-générés à l'initialisation, lot déjà associé, pourcentages respectés                |
| RG-11 | Format ticket : CHAR(10) alphanumérique `[A-Z0-9]`, insensible à la casse (normalisation majuscules)  |
| RG-12 | Idempotence : un code ne peut être soumis qu'une seule fois (contrainte unicité en base)              |
| RG-13 | Soumission ticket = opération atomique avec verrouillage ligne (prévention race conditions)           |
| RG-14 | Délai de réclamation : durée du jeu (30j) + 30 jours supplémentaires post-clôture (configurable)     |

### Répartition des lots

| Lot                             | Pourcentage | Valeur      |
|---------------------------------|-------------|-------------|
| Infuseur à thé                  | 60%         | —           |
| Boîte 100g thé détox/infusion   | 20%         | —           |
| Boîte 100g thé signature        | 10%         | —           |
| Coffret découverte              | 6%          | 39€         |
| Coffret découverte              | 4%          | 69€         |
| Grand Prix (tirage final)       | 1 gagnant   | 360€ (1 an) |

### Flux 1 — Inscription au jeu (UC-05)
1. Visiteur accède à la landing page et clique sur "Je participe"
2. Remplit le formulaire (nom, prénom, email, téléphone, genre, date naissance)
3. Coche RGPD → validation serveur → création lead en base
4. Sync asynchrone Brevo + événement Google Analytics
5. Envoi email de confirmation (template Brevo)
6. Redirection vers page de confirmation + invitation à soumettre un ticket

### Flux 2 — Soumission d'un code ticket (UC-06)
1. Client connecté saisit le code dans "Mes tickets"
2. Validation format côté client (10 chars alphanum, temps réel)
3. API : validation serveur + rate limit (max 20 soumissions/heure/utilisateur)
4. Transaction avec verrouillage exclusif (`SELECT FOR UPDATE`) sur la ligne ticket
5. Vérification : ticket existant, non utilisé, période ouverte
6. Création participation en base + marquage ticket utilisé (horodatage)
7. Réponse avec infos du lot + email Brevo + événement analytics

### Flux 3 — Remise d'un lot en boutique (Employé)
1. Recherche client par nom, email ou scan ticket
2. Affichage des lots en attente de réclamation
3. Vérification identité client
4. Confirmation remise → statut mis à jour (lot marqué remis + horodatage employé)

### Flux 4 — Tirage au sort Grand Prix (Admin)
1. Vérification que le jeu est clôturé
2. Constitution liste participants éligibles (1 par client — RG-05)
3. Algorithme aléatoire cryptographiquement sécurisé côté serveur
4. Génération PV horodaté → transmission à Maître Arnaud Rick (huissier)
5. Notification gagnant par email (Brevo) + publication résultat sur site

---

## 6. Arborescence fonctionnelle du site

| Espace  | Section      | Pages / Fonctionnalités                                            |
|---------|--------------|--------------------------------------------------------------------|
| Public  | Présentation | Landing page, Lots à gagner, Règlement                             |
| Public  | Accès        | Formulaire d'inscription, Connexion (email / Google / Facebook)    |
| Public  | Légal        | Mentions légales, Politique de confidentialité, Page de clôture    |
| Client  | Mon espace   | Tableau de bord, Soumettre un ticket                               |
| Client  | Historique   | Historique des gains, Gérer mon profil                             |
| Admin   | Supervision  | Dashboard statistiques, Gestion des utilisateurs                   |
| Admin   | Actions      | Export emailing, Tirage au sort Grand Prix, Procès-verbal          |
| Employé | Boutique     | Rechercher un client, Valider la remise d'un lot                   |

**Règles de navigation :**
- Profondeur max : 3 niveaux (règle des 3 clics)
- Guards de route RBAC côté front + middleware auth côté serveur
- Pages légales accessibles sans authentification

---

## 7. Acteurs du système

| Acteur            | Type       | Rôle                                                                              |
|-------------------|------------|-----------------------------------------------------------------------------------|
| Visiteur          | Primaire   | Consulter le jeu, les lots, le règlement, s'inscrire                              |
| Client (connecté) | Primaire   | Soumettre tickets, consulter historique gains, gérer profil                       |
| Administrateur    | Primaire   | Statistiques, gestion utilisateurs, export emailing, tirage au sort               |
| Employé boutique  | Primaire   | Rechercher client, valider remise de lot                                          |
| Brevo             | Secondaire | Sync contacts, emails transactionnels et promotionnels                            |
| Google Analytics  | Secondaire | Collecte événements (inscription, soumission ticket, gain remis)                  |

---

## 8. Variables d'environnement

> Ne jamais mettre de valeurs réelles ici. Référence : `.env.example`

| Variable                 | Obligatoire | Description                              |
|--------------------------|-------------|------------------------------------------|
| `DATABASE_URL`           | ✅          | URL PostgreSQL (Prisma)                  |
| `REDIS_URL`              | ✅          | URL Redis                                |
| `JWT_SECRET`             | ✅          | Secret JWT                               |
| `GOOGLE_CLIENT_ID`       | ✅          | OAuth2 Google                            |
| `GOOGLE_CLIENT_SECRET`   | ✅          | OAuth2 Google                            |
| `FACEBOOK_CLIENT_ID`     | ✅          | OAuth2 Facebook                          |
| `FACEBOOK_CLIENT_SECRET` | ✅          | OAuth2 Facebook                          |
| `BREVO_API_KEY`          | ✅          | API Brevo (emailing)                     |
| `NEXT_PUBLIC_GA_ID`      | ✅          | Google Analytics ID                      |
| `NEXTAUTH_SECRET`        | ✅          | Secret sessions Next.js                  |
| `NEXTAUTH_URL`           | ✅          | URL publique de la webapp                |
| `API_URL`                | ✅          | URL interne de l'API NestJS              |
| `SONARQUBE_TOKEN`        | CI/CD       | Token SonarQube pour le pipeline Jenkins |

---

## 9. Commandes essentielles

```bash
# Installation
npm install

# Développement (API NestJS)
npm run start:dev

# Développement (WebApp Next.js)
npm run dev

# Build production
npm run build

# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Couverture de tests
npm run test:cov

# Migrations Prisma
npx prisma migrate dev

# Génération du client Prisma
npx prisma generate

# Seed initial (génération des 500 000 tickets)
npx prisma db seed

# Lint
npm run lint

# Format
npm run format

# Docker (env de développement complet)
docker-compose up -d
```

---

## 10. Stratégie de tests

| Niveau       | Outil               | Déclenchement                          | Rapport              |
|--------------|---------------------|----------------------------------------|----------------------|
| Unitaires    | Jest                | Push / Merge Request (CI)              | LCOV/XML → SonarQube |
| Intégration  | Jest + Docker       | Après unitaires (CI)                   | SonarQube + Jenkins  |
| E2E          | Playwright / Cypress| Automatique en PREPROD (bloquant)      | HTML + screenshots   |
| Performance  | K6                  | PREPROD avant validation PROD          | JSON → Grafana       |
| Qualité code | SonarQube           | Après build + tests (CI)               | Dashboard + PDF      |

**Pyramide de tests :** majorité de tests unitaires. Blocage automatique du pipeline si quality gate SonarQube non atteinte.

---

## 11. Hébergement & Sauvegardes

- **Prestataire :** OVHcloud (France, conformité RGPD)
- **Instance :** Public Cloud — 4-8 vCPU, 8-16 Go RAM, 160 Go SSD NVMe, bande passante ≥ 500 Mbps, SLA ≥ 99,9%
- **Coût estimé :** 80-120€ HT/mois pendant la période du jeu (downscaling possible après)

**Politique de sauvegarde :**

| Fréquence           | Rétention | Détail               |
|---------------------|-----------|----------------------|
| Toutes les 6h (jeu) | 7 jours   | Phase critique       |
| Quotidienne         | 14 jours  | Standard             |
| Mensuelle           | 12 mois   | Archivage légal      |

Chiffrement au repos et en transit. Stockage sur support distinct (S3). Principe 3-2-1. Test de restauration obligatoire avant lancement.

---

## 12. Décisions d'architecture (ADR)

### ADR-001 : NestJS (vs Express / Fastify)
- **Décision :** NestJS 10
- **Justification :** Structure modulaire adaptée à une API multi-modules (auth, tickets, users, gains, stats). TypeScript natif, Swagger intégré, validation avec class-validator, Jest intégré.

### ADR-002 : Next.js 14 App Router (vs React SPA / Vue/Nuxt)
- **Décision :** Next.js 14 avec App Router
- **Justification :** SEO optimal (SSR/SSG), Server Components pour la performance, optimisation images automatique, écosystème React mature.

### ADR-003 : Prisma (vs TypeORM / Sequelize)
- **Décision :** Prisma
- **Justification :** Génération de types TypeScript automatique, migrations intuitives, schéma déclaratif, DX excellent.

### ADR-004 : Codes pré-générés (vs génération à la volée)
- **Décision :** 500 000 codes générés à l'initialisation du jeu avec lot déjà associé
- **Justification :** Obligation légale de respecter les pourcentages de gains dès le début. Contrôle huissier (Maître Arnaud Rick). Traçabilité complète.

### ADR-005 : OVHcloud (vs AWS / Azure / GCP)
- **Décision :** OVHcloud Public Cloud
- **Justification :** Hébergement Europe (conformité RGPD), bon rapport performance/prix, scalabilité temporaire, support Docker/Linux.

---

## 13. Points d'attention pour Claude

- **Ne jamais modifier le schéma Prisma** sans vérifier l'impact sur les contraintes d'intégrité documentées (section 4).
- **Les 500 000 tickets sont pré-générés** : tout code touchant à la génération de codes doit respecter strictement les pourcentages RG-10.
- **Atomicité obligatoire** sur toute soumission de ticket (RG-13) — ne jamais supprimer le `SELECT FOR UPDATE`.
- **Mode silencieux RGPD** (RG-01) : une tentative d'inscription avec un email déjà existant ne doit JAMAIS retourner d'erreur visible côté client.
- **1 participation par client** pour le Grand Prix (RG-05) — ne pas confondre avec les participations aux lots normaux.
- Le dossier des migrations Prisma est **auto-généré** — ne pas éditer manuellement.
- Mettre à jour ce fichier après tout changement d'architecture, de stack ou de règle métier.
- Les conventions de codage complètes sont dans `CONVENTIONS.md`.

---

## 14. Contacts & Ressources

| Ressource        | Info                                            |
|------------------|-------------------------------------------------|
| Client           | M. Eric Bourdon — Thé Tip Top                   |
| Siège social     | 18 rue Léon Frot, 75011 Paris                   |
| Statut juridique | SA — capital social 150 000€                    |
| Huissier         | Maître Arnaud Rick (règlement + tirage)         |
| Domaine prod     | jeu.thetiptop.fr                                |
| Repo             | <!-- URL GitLab à compléter -->                 |
| Gestion projet   | Notion + GanttProject                           |
| Design           | Figma + Adobe Suite (Illustrator / Photoshop)   |
| Staging          | <!-- URL à compléter -->                        |
