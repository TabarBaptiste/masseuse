# CONVENTIONS.md — Règles de Codage

> Règles obligatoires pour ce projet. Claude doit les respecter systématiquement.
> Stack : NestJS 10 / Next.js 14 / TypeScript / Prisma / PostgreSQL / Redis
> Dernière mise à jour : 2026-03-20

---

## 1. Principes généraux

- Lisibilité avant concision : un code qu'on peut lire est un code qu'on peut maintenir.
- Chaque fonction/méthode fait une seule chose (principe de responsabilité unique).
- Commenter le **POURQUOI**, jamais le QUOI (le code dit déjà le quoi).
- Aucun secret dans le code source — toujours passer par les variables d'environnement.
- <!-- Ajouter ici les principes généraux supplémentaires décidés par Baptiste -->

---

## 2. Nommage

### Variables & Fonctions

| Cas             | Convention         | Exemple                            |
|-----------------|--------------------|------------------------------------|
| Variable        | `camelCase`        | `ticketCode`, `userId`             |
| Constante       | `SCREAMING_SNAKE`  | `MAX_TICKETS`, `JWT_EXPIRATION`    |
| Fonction        | `camelCase`        | `validateTicketCode()`             |
| Classe          | `PascalCase`       | `TicketService`, `UserRepository`  |
| Interface       | `PascalCase`       | `TicketDto`, `CreateUserDto`       |
| Type            | `PascalCase`       | `UserRole`, `PrizeType`            |
| Enum            | `PascalCase`       | `UserRole.ADMIN`, `PrizeType.BOX`  |
| Fichier (back)  | `kebab-case`       | `ticket.service.ts`                |
| Fichier (front) | `kebab-case`       | `ticket-form.tsx`                  |
| Composant React | `PascalCase`       | `TicketForm`, `PrizeCard`          |

### Règles de nommage spécifiques
- Les handlers d'événements React sont préfixés par `handle` : `handleSubmit`, `handleTicketChange`
- Les hooks custom sont préfixés par `use` : `useTicketForm`, `useUserGains`
- Les guards NestJS sont suffixés par `Guard` : `JwtAuthGuard`, `RolesGuard`
- Les DTOs NestJS sont suffixés par `Dto` : `CreateTicketDto`, `SubmitCodeDto`
- Les modules NestJS sont suffixés par `Module` : `TicketsModule`, `AuthModule`
- <!-- Ajouter ici d'autres règles de nommage décidées par Baptiste -->

---

## 3. TypeScript

- **Interdiction d'utiliser `any`** — utiliser `unknown` si le type est incertain, puis le réduire.
- Toujours typer les paramètres de fonction et les valeurs de retour explicitement.
- Préférer `interface` à `type` pour les objets, `type` pour les unions/intersections.
- Les types partagés entre front et back vont dans un dossier `shared/types/`.
- Utiliser `Zod` côté frontend pour la validation des formulaires (schémas réutilisables).
- Utiliser `class-validator` + `class-transformer` côté NestJS pour les DTOs.
- <!-- Ajouter ici d'autres règles TypeScript décidées par Baptiste -->

---

## 4. Structure NestJS (Backend)

### Organisation des modules
Chaque fonctionnalité est un module NestJS indépendant :

```
src/
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    dto/
    guards/
    strategies/
  tickets/
    tickets.module.ts
    tickets.controller.ts
    tickets.service.ts
    dto/
  users/
  leads/
  prizes/
  stats/
  grand-prize/
```

### Règles NestJS
- Toute logique métier va dans le **Service**, jamais dans le Controller.
- Les Controllers ne font que recevoir, déléguer et répondre.
- Les Guards NestJS protègent toutes les routes sensibles (JWT + RBAC).
- Swagger : décorer tous les endpoints avec `@ApiOperation`, `@ApiResponse`.
- <!-- Ajouter ici d'autres règles NestJS décidées par Baptiste -->

---

## 5. Composants Next.js (Frontend)

- Séparer strictement les composants **présentationnels** (UI pure) des composants **conteneurs** (logique/données).
- Props destructurées dans la signature du composant.
- Pas de logique métier dans les composants UI — la logique va dans les hooks.
- Les appels API se font uniquement via React Query (`useQuery`, `useMutation`).
- Pas de `fetch` direct dans les composants.
- <!-- Ajouter ici d'autres règles composants décidées par Baptiste -->

### Structure type d'un composant
```tsx
// 1. Imports externes
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Imports internes
import { Button } from '@/components/ui/button'
import { useTicketForm } from '@/hooks/useTicketForm'

// 3. Types / interfaces locaux
interface TicketFormProps {
  onSuccess: () => void
}

// 4. Composant principal (export default)
export default function TicketForm({ onSuccess }: TicketFormProps) {
  // ...
}
```

---

## 6. Gestion d'état

- **État local** → `useState` / `useReducer`
- **État serveur** → React Query (`useQuery`, `useMutation`)
- **État global UI** → Zustand (uniquement si état partagé entre plusieurs composants non liés)
- Pas de prop drilling au-delà de 2 niveaux — utiliser un contexte ou Zustand.
- <!-- Ajouter ici d'autres règles d'état décidées par Baptiste -->

---

## 7. Gestion des erreurs

- Toujours utiliser `try/catch` sur les opérations async côté serveur.
- Les erreurs NestJS utilisent les exceptions standard (`NotFoundException`, `ConflictException`, etc.).
- Côté frontend, les erreurs React Query sont gérées dans l'UI (état `isError`).
- **Pas de `console.log` en production** — utiliser le logger NestJS (`this.logger.log()`).
- Les messages d'erreur exposés au client sont en **français** (audience française).
- Les logs internes sont en anglais.
- <!-- Ajouter ici d'autres règles de gestion d'erreurs décidées par Baptiste -->

---

## 8. Base de données & API

- **Toujours valider les inputs avec Zod (frontend) ou class-validator (backend)** avant toute insertion.
- Pas de requête SQL brute — utiliser Prisma exclusivement.
- Les endpoints suivent la convention REST : verbe HTTP + ressource au pluriel.
  - `GET /tickets` — liste
  - `POST /tickets/submit` — soumission d'un code
  - `GET /users/:id/gains` — historique gains
- Toujours paginer les listes (paramètres `page` et `limit`).
- **Règle critique RG-13** : toute soumission de ticket utilise une transaction avec `SELECT FOR UPDATE` — ne jamais supprimer ce verrouillage.
- **Règle critique RG-01** : le mode silencieux RGPD sur les doublons d'email ne doit jamais lever d'erreur côté client.
- <!-- Ajouter ici d'autres règles BDD/API décidées par Baptiste -->

---

## 9. Tests

- Toute nouvelle feature doit avoir ses tests unitaires Jest.
- Nommage des tests : `it('should [action] when [condition]')`
- Pas de logique dans les mocks — les mocks restent simples.
- Les tests d'intégration utilisent une base PostgreSQL isolée en conteneur Docker.
- Coverage minimum : <!-- À définir par Baptiste (recommandé : 80%) -->
- <!-- Ajouter ici d'autres règles de tests décidées par Baptiste -->

---

## 10. Git & Versioning

### Messages de commit (Conventional Commits)
```
type(scope): description courte en français

Types : feat | fix | chore | docs | refactor | test | style | perf

Exemples :
feat(tickets): ajouter la validation du format CHAR(10)
fix(auth): corriger l'expiration du token JWT
refactor(prizes): extraire la logique de calcul des pourcentages
test(leads): ajouter les tests unitaires du service LeadsService
```

### Branches
| Type    | Nommage               | Exemple                        |
|---------|-----------------------|--------------------------------|
| Feature | `feat/description`    | `feat/ticket-submission`       |
| Fix     | `fix/description`     | `fix/jwt-expiration`           |
| Hotfix  | `hotfix/description`  | `hotfix/race-condition-ticket` |
| Release | `release/vX.Y.Z`      | `release/v1.0.0`               |

### Règles Git
- Pas de push direct sur `main` — Merge Request obligatoire.
- <!-- Ajouter ici d'autres règles Git décidées par Baptiste (reviews, squash merge, etc.) -->

---

## 11. Performance

- Lazy loading obligatoire pour les routes Next.js.
- Pas d'image sans dimension explicite (Next.js `<Image width height />`).
- Les statistiques admin sont cachées dans Redis (invalidation toutes les 5 minutes).
- Le rate limiting est géré côté serveur via Redis (max 20 soumissions/heure/utilisateur).
- <!-- Ajouter ici d'autres règles performance décidées par Baptiste -->

---

## 12. Sécurité

- Jamais de secret dans le code source — variables d'environnement uniquement.
- Toujours sanitizer et valider les inputs utilisateur (Zod + class-validator).
- Les permissions sont vérifiées **côté serveur** (Guards NestJS), jamais côté client uniquement.
- Le hachage des mots de passe utilise un algorithme renforcé (bcrypt ou argon2).
- Protection anti-bot : honeypot + rate limiting (RG-03).
- L'algorithme de tirage au sort du Grand Prix est **cryptographiquement sécurisé** (côté serveur).
- <!-- Ajouter ici d'autres règles sécurité décidées par Baptiste -->

---

## 13. Ce qui est INTERDIT

> Patterns à ne jamais utiliser dans ce projet.

- ❌ `any` en TypeScript — utiliser `unknown` ou le bon type
- ❌ Requêtes SQL brutes — Prisma uniquement
- ❌ `console.log` en production
- ❌ Suppression ou contournement du `SELECT FOR UPDATE` sur la soumission de ticket (RG-13)
- ❌ Retourner une erreur visible au client en cas de doublon d'email (RG-01 / mode silencieux RGPD)
- ❌ Commits de fichiers `.env` ou tout fichier contenant des secrets
- ❌ Push direct sur `main`
- ❌ Édition manuelle des fichiers de migration Prisma (auto-générés)
- ❌ <!-- Ajouter ici d'autres interdits décidés par Baptiste -->

---

## 14. Ce qui est OBLIGATOIRE

> À faire systématiquement, sans exception.

- ✅ Typer tous les paramètres de fonction et valeurs de retour
- ✅ Décorer tous les endpoints NestJS avec Swagger (`@ApiOperation`, `@ApiResponse`)
- ✅ Ajouter un test Jest pour chaque nouveau service ou logique métier
- ✅ Utiliser une transaction avec verrouillage pour toute soumission de ticket
- ✅ Valider tous les inputs utilisateur avant insertion en base
- ✅ Mettre à jour `CLAUDE.md` après tout changement d'architecture, de stack ou de règle métier
- ✅ <!-- Ajouter ici d'autres obligations décidées par Baptiste -->
