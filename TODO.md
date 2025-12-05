# 📋 Plan de Développement - Application Massage

## 🎯 Vue d'ensemble

Ce document détaille les **corrections techniques**, **réorganisations structurelles** et **améliorations fonctionnelles** à apporter à l'application de gestion de massages.

---

## 🔧 1. Problèmes techniques généraux

### 1.1. 🔐 Connexion / Déconnexion
- **Corriger la logique du guard/middleware** pour une authentification robuste
- **Empêcher la redirection automatique** vers l'accueil lors de la déconnexion d'un utilisateur PRO/ADMIN après visite de pages protégées

### 1.2. 🎛️ Boutons et interactions
- **Vérifier tous les boutons** de la page d'accueil pour s'assurer de leur fonctionnalité
- **Nettoyer les handlers** et événements click défectueux

### 1.3. 🎨 Icônes et affichage
- **Rendre le logo du calendrier visible** sur les appareils mobiles
- **Ajouter/corriger les icônes manquantes** dans le Dashboard PRO

### 1.4. ✅ Validation Login
- **Retirer l'obligation des 8 caractères** uniquement sur la page de connexion

### 1.5. 📊 Dashboard Admin - Compteurs utilisateurs
- **Harmoniser l'affichage des statistiques** avec la présentation du Dashboard PRO

---

## 🏗️ 2. Dashboard Admin – Problèmes de structure

### 2.1. 🚮 Boutons inutiles à supprimer
Les actions suivantes doivent être **intégrées directement dans leurs pages respectives** :
- ❌ Gérer les rôles
- ❌ Ajouter un utilisateur
- ❌ Ajouter un service
- ❌ Modifier les prix

---

## 📄 3. Réorganisation des pages

### 3.1. 👥 Page : "Voir tous les utilisateurs"
**Transformer en CRUD complet** avec les actions suivantes :
- ✏️ Modifier le rôle d'un utilisateur
- ➕ Ajouter un nouvel utilisateur
- 🗑️ Supprimer un utilisateur

### 3.2. 💆‍♀️ Page : "Voir tous les services"
**Intégrer le CRUD PRO/ADMIN** :
- ➕ Ajouter un service
- ✏️ Modifier un service existant
- 💰 Modifier les prix
- 🔄 Activer/désactiver un service

> **Note** : Supprimer les boutons correspondants du Dashboard

### 3.3. ⚙️ Page : "Configuration"
- ✅ **Vérifier l'affichage complet** des paramètres du site (`site_settings`)
- ✅ **Vérifier le CRUD** complet
- ❓ **Déterminer l'usage** du bouton Notifications (emails/SMS/alertes internes)

### 3.4. 📅 Page : "Voir toutes les réservations"
- 🔄 **Harmoniser avec le Dashboard PRO** (ou fusionner si contenu identique)

### 3.5. 📈 Page : "Rapports et statistiques" *(À créer)*
Tableau de bord analytique affichant :
- 📊 **Nombre de réservations** (total/mensuel/quotidien)
- 👥 **Activité des clients** (nouveaux vs récurrents)
- 📅 **Périodes de l'année les plus actives**
- 🕐 **Périodes de la journée les plus actives**

---

## 🛠️ 4. Boutons avancés (Admin avancé)

### 4.1. 💾 Sauvegarder la base de données
- **Implémenter une fonctionnalité de backup SQL** téléchargeable
- Format : `.sql` ou `.zip`

### 4.2. 🗑️ Vider le cache
**Définir précisément ce qui doit être purgé** :
- 🔐 Sessions utilisateur ?
- 🚀 Cache API ?
- ⚡ ISR Next.js ?

### 4.3. 📋 Logs système *(À créer)*
Page dédiée affichant :
- 🔧 **Logs backend** (erreurs, requêtes)
- 📝 **Logs d'accès** (connexions, actions)
- ⏰ **Logs des tâches automatiques** (cron/workers)

### 4.4. 🔄 Mise à jour système
**Définir la fonction exacte** :
- 📦 Mise à jour du code source ?
- 🗄️ Mise à jour du schéma Prisma ?
- 🔧 Mise à jour des services/dépendances ?

---

## ✅ Checklist rapide - Résumé

### 🔧 Corrections urgentes
- [x] Redirection après déconnexion
- [x] Boutons défectueux
- [x] Icônes manquantes
- [ ] Icônes manquantes calendrier
- [x] Règle des 8 caractères login
- [x] Statistiques Dashboard Admin

### 🚮 Suppressions
- [x] Bouton "Gérer les rôles"
- [x] Bouton "Ajouter un utilisateur"
- [x] Bouton "Ajouter un service"
- [x] Bouton "Modifier les prix"

### 🏗️ Réorganisation
- [x] CRUD complet sur "Voir tous les utilisateurs"
- [x] CRUD complet sur "Voir tous les services"
- [ ] Nouvelle page Statistiques
- [ ] Clarifier page Réservations
- [ ] Clarifier page Notifications

### 🧑‍💻 Définition boutons avancés
- [ ] Sauvegarde BDD
- [ ] Vider cache
- [ ] Logs système
- [ ] Mise à jour système

---

## 📝 Notes et commentaires

- **Priorité** : Commencer par les corrections techniques générales
- **Architecture** : Préférer l'intégration directe plutôt que la multiplication des boutons
- **UX** : Maintenir une interface cohérente et intuitive
- **Sécurité** : Vérifier les permissions sur toutes les nouvelles fonctionnalités

---

*Dernière mise à jour : Décembre 2025*