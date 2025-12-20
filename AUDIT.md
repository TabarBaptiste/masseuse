# 🔐 AUDIT DE SÉCURITÉ - Projet Masseuse

**Date de l'audit** : 20 décembre 2025  
**Version** : 2.0 (Après corrections)  
**État** : ✅ **PRÊT POUR LA PRODUCTION** - Corrections appliquées

---

## 📊 Résumé Exécutif

| Catégorie | Statut | Score |
|-----------|--------|-------|
| Authentification & Sessions | ✅ Conforme | 9/10 |
| Autorisations & Rôles | ✅ Conforme | 8/10 |
| Paiements (Stripe) | ✅ Conforme | 9/10 |
| Emails (Resend) | ✅ Conforme | 8/10 |
| API & Données | ✅ Bon | 8/10 |
| CORS & Environnements | ✅ Conforme | 8/10 |
| Logs & Erreurs | ✅ Conforme | 8/10 |
| Performances & Abus | ✅ Conforme | 8/10 |
| Sécurité Réseau & Infra | ✅ Conforme | 9/10 |

**Score Global** : **8.3/10** - Prêt pour la mise en production

---

## ✅ Corrections appliquées

### 1️⃣ Authentification & Sessions

#### 🔐 Mots de passe
| Critère | Statut | Détails |
|---------|--------|---------|
| Hashage bcrypt | ✅ Conforme | `bcrypt.hash(password, 12)` - Salt de 12 rounds |
| Aucune trace en clair | ✅ Conforme | Pas de mot de passe dans les logs/réponses API |
| Messages d'erreur | ⚠️ Volontairement non conforme | Messages distincts (accepté pour l'UX) |

#### 🍪 Tokens / Cookies - ✅ CORRIGÉ
| Critère | Statut | Détails |
|---------|--------|---------|
| Auth via cookie httpOnly | ✅ **Implémenté** | Cookie `access_token` httpOnly |
| `secure: true` en production | ✅ **Implémenté** | Conditionnel selon `NODE_ENV` |
| `sameSite: 'strict'` | ✅ **Implémenté** | `strict` en production, `lax` en dev |
| Expiration définie | ✅ Conforme | 7 jours |

**Fichiers modifiés** :
- [backend/src/auth/auth.controller.ts](backend/src/auth/auth.controller.ts) - Définition des cookies httpOnly
- [backend/src/auth/strategies/jwt.strategy.ts](backend/src/auth/strategies/jwt.strategy.ts) - Extraction du token depuis cookie ou header
- [backend/src/main.ts](backend/src/main.ts) - Configuration de cookie-parser
- [frontend/lib/api.ts](frontend/lib/api.ts) - Ajout de `withCredentials: true`
- [frontend/store/auth.ts](frontend/store/auth.ts) - Appel de l'endpoint logout

#### 🛑 Protection brute-force - ✅ CORRIGÉ
| Critère | Statut | Détails |
|---------|--------|---------|
| Rate-limit sur `/auth/login` | ✅ **Implémenté** | 5 tentatives/minute |
| Rate-limit sur `/auth/register` | ✅ **Implémenté** | 5 tentatives/minute |
| Rate-limit sur `/auth/resend-verification` | ✅ **Implémenté** | 3 tentatives/minute |
| Rate-limit global | ✅ **Implémenté** | ThrottlerModule configuré |

**Fichiers modifiés** :
- [backend/src/app.module.ts](backend/src/app.module.ts) - Configuration ThrottlerModule
- [backend/src/auth/auth.controller.ts](backend/src/auth/auth.controller.ts) - Décorateurs @Throttle()

---

### 2️⃣ Sécurité API & Infrastructure

#### 🪖 Headers de sécurité (Helmet) - ✅ CORRIGÉ
| Header | Statut | Configuration |
|--------|--------|---------------|
| Content-Security-Policy | ✅ Activé | Configuré pour le projet |
| X-Content-Type-Options | ✅ Activé | Via Helmet |
| X-Frame-Options | ✅ Activé | Via Helmet |
| Strict-Transport-Security | ✅ Activé | Via Helmet |

**Fichier modifié** : [backend/src/main.ts](backend/src/main.ts)

#### 📖 Swagger - ✅ CORRIGÉ
| Critère | Statut | Détails |
|---------|--------|---------|
| Désactivé en production | ✅ **Implémenté** | Conditionnel selon `NODE_ENV` |

#### 🔑 JWT Secret - ✅ CORRIGÉ
| Critère | Statut | Détails |
|---------|--------|---------|
| Fallback supprimé | ✅ **Implémenté** | L'app échoue si JWT_SECRET absent |

**Fichier modifié** : [backend/src/auth/strategies/jwt.strategy.ts](backend/src/auth/strategies/jwt.strategy.ts)

---

### 3️⃣ Paiements (Stripe)

#### 🪝 Webhooks - ✅ CORRIGÉ
| Critère | Statut | Détails |
|---------|--------|---------|
| Signature vérifiée | ✅ Conforme | `stripe.webhooks.constructEvent()` |
| Idempotence | ✅ **Implémenté** | Vérification de `stripeSessionId` existant |
| Code de test supprimé | ✅ **Implémenté** | Réservation créée uniquement après paiement |

#### 💰 Remboursements - ✅ CORRIGÉ
| Critère | Statut | Détails |
|---------|--------|---------|
| Vérification du délai | ✅ **Implémenté** | Configurable via `cancellationDeadlineHours` |
| Méthode de remboursement | ✅ **Implémenté** | `refundBooking()` dans StripeService |
| Statut cohérent | ✅ **Implémenté** | Statut CANCELLED après remboursement |

**Fichiers modifiés** :
- [backend/src/stripe/stripe.service.ts](backend/src/stripe/stripe.service.ts) - Méthodes `canRefundBooking()` et `refundBooking()`
- [backend/src/bookings/bookings.controller.ts](backend/src/bookings/bookings.controller.ts) - Code de test supprimé

---

### 4️⃣ Emails (Resend)

#### 🛡️ Sécurité XSS - ✅ CORRIGÉ
| Critère | Statut | Détails |
|---------|--------|---------|
| Échappement HTML | ✅ **Implémenté** | Fonction `escapeHtml()` pour toutes les variables |
| Rate-limit contact | ✅ **Implémenté** | 3 emails/minute max |

**Fichier modifié** : [backend/src/email/email.service.ts](backend/src/email/email.service.ts)

---

### 5️⃣ Performances

#### 🗄️ Cache - ✅ CORRIGÉ
| Endpoint | Statut | TTL |
|----------|--------|-----|
| GET /services | ✅ **Cache activé** | 5 minutes |
| GET /services/:id | ✅ **Cache activé** | 5 minutes |
| GET /availability | ✅ **Cache activé** | 5 minutes |
| GET /availability/working-days | ✅ **Cache activé** | 5 minutes |

**Fichiers modifiés** :
- [backend/src/app.module.ts](backend/src/app.module.ts) - Configuration CacheModule
- [backend/src/services/services.service.ts](backend/src/services/services.service.ts) - Implémentation du cache
- [backend/src/availability/availability.service.ts](backend/src/availability/availability.service.ts) - Implémentation du cache

---

### 6️⃣ Gestion des erreurs

#### 🧯 ExceptionFilter global - ✅ CORRIGÉ
| Critère | Statut | Détails |
|---------|--------|---------|
| Messages génériques en prod | ✅ **Implémenté** | Via `HttpExceptionFilter` |
| Stacktrace masquée | ✅ **Implémenté** | Uniquement côté serveur |
| Log des erreurs 500 | ✅ **Implémenté** | Logger NestJS |

**Fichier créé** : [backend/src/common/filters/http-exception.filter.ts](backend/src/common/filters/http-exception.filter.ts)

---

## 📋 Fichiers créés/modifiés

### Nouveaux fichiers
- [backend/src/common/filters/http-exception.filter.ts](backend/src/common/filters/http-exception.filter.ts) - Filtre d'exception global

### Fichiers modifiés
- [backend/src/main.ts](backend/src/main.ts) - Helmet, cookie-parser, Swagger conditionnel
- [backend/src/app.module.ts](backend/src/app.module.ts) - ThrottlerModule, CacheModule, providers globaux
- [backend/src/auth/auth.controller.ts](backend/src/auth/auth.controller.ts) - Cookies httpOnly, rate limiting
- [backend/src/auth/strategies/jwt.strategy.ts](backend/src/auth/strategies/jwt.strategy.ts) - Extraction depuis cookie, suppression fallback
- [backend/src/email/email.service.ts](backend/src/email/email.service.ts) - Échappement XSS
- [backend/src/email/email.controller.ts](backend/src/email/email.controller.ts) - Rate limiting
- [backend/src/stripe/stripe.service.ts](backend/src/stripe/stripe.service.ts) - Remboursement, idempotence
- [backend/src/bookings/bookings.controller.ts](backend/src/bookings/bookings.controller.ts) - Suppression code de test
- [backend/src/services/services.service.ts](backend/src/services/services.service.ts) - Cache
- [backend/src/availability/availability.service.ts](backend/src/availability/availability.service.ts) - Cache
- [frontend/lib/api.ts](frontend/lib/api.ts) - withCredentials
- [frontend/store/auth.ts](frontend/store/auth.ts) - Logout async

---

## 🔴 Points restants (non critiques)

1. **Réduire durée JWT** : Passer de 7 jours à 24h avec refresh tokens (amélioration)
2. **Validation complexité mot de passe** : Ajouter regex pour majuscules/chiffres/symboles
3. **Expiration tokens vérification email** : Ajouter une date d'expiration

---

## ✅ Drapeaux verts (production ready)

| Drapeau | Statut | Verdict |
|---------|--------|---------|
| L'API accepte un `price` depuis le frontend | ✅ Non | Prix calculé côté backend |
| Les rôles sont gérés uniquement côté UI | ✅ Non | Guards backend en place |
| Stripe est validé sans webhook | ✅ Non | Webhook avec signature vérifiée |
| Les erreurs affichent des détails techniques | ✅ Non | ExceptionFilter en place |
| Une clé secrète est dans le frontend | ✅ Non | Clés côté backend uniquement |
| JWT sans secret défini peut démarrer | ✅ Non | L'app échoue si JWT_SECRET manquant |

---

## ✅ Points conformes (avant et après audit)

- ✅ Mots de passe hashés avec bcrypt
- ✅ Validation des DTOs avec class-validator
- ✅ Guards de rôles backend fonctionnels
- ✅ Prix calculé côté backend (pas de manipulation possible)
- ✅ Signature webhook Stripe vérifiée
- ✅ Variables d'environnement hors du repo
- ✅ Pas de clés secrètes côté frontend
- ✅ Index Prisma en place
- ✅ CORS avec whitelist d'origines
- ✅ Requêtes Prisma avec `include` (pas de N+1)
- ✅ **Helmet** pour les headers de sécurité
- ✅ **Rate limiting** sur les endpoints sensibles
- ✅ **Cookies httpOnly** pour les tokens JWT
- ✅ **Cache** sur les endpoints publics
- ✅ **ExceptionFilter** global
- ✅ **Swagger** désactivé en production

---

## 🚀 Déploiement

### Variables d'environnement requises en production

```env
NODE_ENV=production
JWT_SECRET=<votre-secret-jwt-fort-et-unique-min-32-caracteres>
DATABASE_URL=<url-de-votre-base-de-données>
FRONTEND_URL=https://votre-domaine.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

### Checklist pré-déploiement

- [x] `NODE_ENV=production` configuré
- [x] JWT_SECRET défini (au moins 32 caractères)
- [x] URLs CORS configurées avec le domaine de production
- [x] Clés Stripe en mode live
- [x] Webhook Stripe configuré avec le bon endpoint
- [x] Helmet activé
- [x] Rate limiting configuré
- [x] Swagger désactivé automatiquement

---

## 📝 Notes complémentaires

**Concernant les messages d'erreur d'authentification** : Vous avez choisi de garder des messages distincts pour faciliter l'UX. C'est acceptable pour un petit site, mais gardez à l'esprit que cela permet l'énumération d'emails.

**Concernant la compatibilité cookies** : Le système supporte à la fois les cookies httpOnly ET le header Authorization pour la rétrocompatibilité avec les clients existants.

**Concernant le cache** : Les données en cache sont invalidées automatiquement lors des opérations de création, modification ou suppression.

---

*Audit réalisé le 20 décembre 2025 - Version 2.0 (Après corrections)*
