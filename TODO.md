
📌 1. Problèmes techniques généraux

1.1. Connexion / Déconnexion
	•	Corriger la logique du guard / middleware.
	•	Empêcher la redirection automatique vers l’accueil lorsqu’un utilisateur PRO / ADMIN se déconnecte après avoir visité une page protégée.

1.2. Boutons
	•	Vérifier tous les boutons de la page d’accueil.
	•	Nettoyer les handlers et les événements click défectueux.

1.3. Icônes et affichage
	•	Rendre le logo du calendrier visible sur mobile.
	•	Ajouter / corriger les icônes manquantes dans le Dashboard PRO.

1.4. Validation Login
	•	Retirer l’obligation des 8 caractères uniquement sur la page Login.

1.5. Dashboard Admin : compteur utilisateurs
	•	Harmoniser l’affichage des statistiques avec la présentation du Dashboard PRO.

⸻

📌 2. Dashboard Admin – Problèmes de structure

2.1. Boutons inutiles à supprimer
	•	Supprimer :
	•	Gérer les rôles
	•	Ajouter un utilisateur
	•	Ajouter un service
	•	Modifier les prix
➡️ Ces actions doivent être intégrées directement dans leurs pages respectives.

⸻

📌 3. Réorganisation des pages

3.1. Page : “Voir tous les utilisateurs”
	•	Ajouter les actions du CRUD directement dans cette page :
	•	Modifier le rôle
	•	Ajouter un utilisateur
	•	Supprimer un utilisateur
➡️ La page devient un CRUD complet pour les utilisateurs.

3.2. Page : “Voir tous les services”
	•	conserver la redirection vers la page “Services”, mais y intégrer le CRUD PRO / ADMIN :
	•	Ajouter un service
	•	Modifier un service
	•	Modifier les prix
	•	Activer / désactiver un service
➡️ Les boutons “Ajouter un service” et “Modifier les prix” du Dashboard doivent être supprimés.

3.3. Page : “Configuration”
	•	Vérifier l’affichage complet de site_settings.
	•	Vérifier le CRUD.
	•	Déterminer l’usage exact du bouton Notifications (emails ? SMS ? alertes internes ?).

3.4. Page : “Voir toutes les réservations”
	•	Harmoniser avec la page du Dashboard PRO (ou fusionner si même contenu).

3.5. Page : “Rapports et statistiques”

Créer un tableau de bord analytique affichant :
	•	Nombre de réservations
	•	Activité des clients
	•	Périodes de l’année les plus actives
	•	Périodes de la journée les plus actives

⸻

📌 4. Boutons avancés (Admin avancé)

4.1. Sauvegarder la base de données
	•	Mettre en place une fonctionnalité de backup SQL téléchargeable.

4.2. Vider le cache
	•	Définir ce qui doit être purgé :
	•	sessions ?
	•	cache API ?
	•	ISR Next.js ?

4.3. Logs système

Créer une page affichant :
	•	Logs backend
	•	Logs d’accès
	•	Logs des tâches automatiques (cron / workers)

4.4. Mise à jour système

Définir la fonction exacte du bouton :
	•	Mise à jour du code ?
	•	Mise à jour du schéma Prisma ?
	•	Mise à jour des services / dépendances ?

⸻

📌 Résumé (Checklist rapide)

🔧 Corrections urgentes
	•	Redirection après déconnexion
	•	Boutons qui bug
	•	Icônes manquantes
	•	Règle des 8 caractères login
	•	Statistiques Dashboard Admin

🚮 Suppressions
	•	Gérer les rôles
	•	Ajouter un utilisateur
	•	Ajouter un service
	•	Modifier les prix

🏗 Réorganisation
	•	CRUD complet sur “Voir tous les utilisateurs”
	•	CRUD complet sur “Voir tous les services”
	•	Nouvelle page Statistiques
	•	Clarifier page Réservations
	•	Clarifier page Notifications

🧑‍💻 Définition de boutons avancés
	•	Sauvegarde BDD
	•	Vider cache
	•	Logs système
	•	Mise à jour système
