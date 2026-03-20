# WEEKLY_AUDIT.md — Prompt d'Audit Hebdomadaire

> À copier-coller tel quel dans une nouvelle conversation chaque fin de semaine.
> Adapter les sections entre `[crochets]` selon le contexte du moment.

---

## PROMPT À EXÉCUTER

```
Tu vas effectuer un audit complet de mon application en te comportant comme plusieurs sous-agents spécialisés qui travaillent en parallèle. Commence par lire CLAUDE.md et CONVENTIONS.md pour comprendre le projet avant toute chose.

---

**CONTEXTE DE LA SEMAINE**
Semaine du : [DATE]
Résumé de ce qui a été fait cette semaine : [DESCRIPTION COURTE]
Zones du code modifiées : [FICHIERS / DOSSIERS TOUCHÉS]
Points qui me préoccupent particulièrement : [OU "Aucun point spécifique"]

---

Lance maintenant les audits suivants. Pour chacun, fournis :
- Un score de 1 à 10
- Les problèmes trouvés (classés Critical / Warning / Info)
- Des recommandations concrètes et priorisées

---

### 🔴 AGENT 1 — Audit Qualité & Conventions
Vérifie la conformité avec CONVENTIONS.md sur l'ensemble du projet.
- Violations de conventions de nommage
- Fichiers mal structurés
- Fonctions trop longues ou trop complexes (cyclomatic complexity)
- Code dupliqué (DRY violations)
- Commentaires manquants ou obsolètes
- TODO/FIXME sans tickets associés

---

### 🟠 AGENT 2 — Audit Sécurité
Analyse le code à la recherche de failles de sécurité.
- Inputs utilisateurs non validés ou non sanitizés
- Secrets potentiellement exposés
- Dépendances avec des CVE connues (vérifie package.json / lockfile)
- Mauvaise gestion des permissions et de l'authentification
- Injections potentielles (SQL, XSS, etc.)
- Exposition d'informations sensibles dans les logs ou les réponses API

---

### 🟡 AGENT 3 — Audit Performance
Identifie les goulots d'étranglement et les régressions de performance.
- Requêtes N+1 vers la base de données
- Calculs lourds dans le thread principal
- Assets non optimisés
- Manque de mise en cache sur les opérations coûteuses
- Re-renders inutiles (si frontend)
- Imports trop lourds / bundle size

---

### 🟢 AGENT 4 — Audit Tests
Évalue la couverture et la qualité des tests.
- Fonctionnalités critiques non testées
- Tests fragiles ou qui testent l'implémentation plutôt que le comportement
- Mocks trop complexes (signe d'un mauvais découplage)
- Tests manquants pour les edge cases
- Régressions potentielles non couvertes par les tests existants

---

### 🔵 AGENT 5 — Audit Architecture & Dette Technique
Analyse la santé globale de l'architecture.
- Couplage fort entre modules qui devraient être indépendants
- Abstractions manquantes ou prématurées
- Incohérences dans les patterns utilisés
- Dépendances circulaires
- Évaluation de la dette technique accumulée cette semaine
- Vérification de la cohérence entre le code et CLAUDE.md (mettre à jour si nécessaire)

---

### ⚪ AGENT 6 — Audit Expérience Développeur (DX)
Évalue la maintenabilité du projet.
- Lisibilité générale du code
- Qualité de la documentation inline
- Clarté des messages d'erreur
- Facilité d'onboarding pour un nouveau développeur
- Cohérence des interfaces et des APIs internes

---

**SYNTHÈSE FINALE**
Une fois les 6 audits terminés :
1. Fournis un tableau récapitulatif avec le score de chaque agent
2. Liste les 3 actions CRITIQUES à faire avant de continuer
3. Liste les 5 améliorations IMPORTANTES pour la semaine suivante
4. Identifie une "quick win" (< 30 min) que je peux faire immédiatement
5. Mets à jour CLAUDE.md si des informations sont devenues obsolètes
6. Propose un focus pour la semaine prochaine basé sur les résultats

Commence.
```

---

## NOTES D'UTILISATION

- **Fréquence** : chaque fin de semaine (vendredi soir ou dimanche)
- **Durée estimée** : 15–30 min de traitement selon la taille du projet
- **Avant de lancer** : s'assurer que CLAUDE.md est à jour pour que les agents aient le bon contexte
- **Après l'audit** : mettre à jour CLAUDE.md si recommandé par l'Agent 5

### Variantes optionnelles à ajouter au prompt selon les besoins :

```
# Ajouter si tu as des dépendances externes critiques :
### AGENT 7 — Audit Dépendances
Vérifie les dépendances npm/pip/etc. :
- Packages outdated avec breaking changes potentiels
- Packages non utilisés à supprimer
- Licences incompatibles avec le projet
- Alternatives plus légères ou mieux maintenues

# Ajouter si tu as une API publique :
### AGENT 8 — Audit API & Contrats
- Cohérence des réponses d'erreur
- Versioning respecté
- Documentation OpenAPI/Swagger à jour
- Breaking changes introduits cette semaine

# Ajouter si tu as un frontend :
### AGENT 9 — Audit Accessibilité
- Attributs ARIA manquants
- Contraste des couleurs
- Navigation au clavier
- Textes alternatifs sur les images
```
