# Documentation TchopMyGrinds

Cette documentation complète décrit l'architecture, l'utilisation et la maintenance de l'application TchopMyGrinds.

## Structure de la Documentation

### 📁 [API Documentation](./api/)
Documentation complète des endpoints API, des modèles de données et des interfaces de communication.

- [Endpoints API](./api/endpoints.md) - Liste complète des endpoints disponibles
- [Modèles de données](./api/models.md) - Structure des données et relations
- [Authentification](./api/authentication.md) - Système d'authentification et autorisation

### 📁 [Frontend Documentation](./frontend/)
Architecture et composants de l'interface utilisateur AngularJS.

- [Architecture Frontend](./frontend/architecture.md) - Structure générale de l'application client
- [Composants](./frontend/components.md) - Contrôleurs, services et directives
- [Géolocalisation](./frontend/geolocation.md) - Système de cartographie et localisation

### 📁 [Database Documentation](./database/)
Structure de base de données et relations entre les modèles.

- [Schéma de base de données](./database/schema.md) - Structure complète des tables
- [Relations](./database/relationships.md) - Associations entre les modèles
- [Migrations](./database/migrations.md) - Historique des modifications

### 📁 [Deployment Documentation](./deployment/)
Configuration et déploiement de l'application.

- [Configuration Render.com](./deployment/render.md) - Déploiement en production
- [Variables d'environnement](./deployment/environment.md) - Configuration des variables
- [Maintenance](./deployment/maintenance.md) - Tâches de maintenance

### 📁 [Guides Utilisateur](./guides/)
Guides d'utilisation pour les différents types d'utilisateurs.

- [Guide Marchands](./guides/merchants.md) - Utilisation pour les commerçants
- [Guide Acheteurs](./guides/buyers.md) - Utilisation pour les clients
- [Guide Administrateurs](./guides/admin.md) - Interface d'administration

## Vue d'ensemble de l'Application

**TchopMyGrinds** est une plateforme e-commerce géolocalisée qui connecte les commerçants locaux avec les clients dans un rayon de 50km.

### Technologies Principales
- **Backend**: Ruby on Rails 6.0, PostgreSQL, Geocoder
- **Frontend**: AngularJS 1.8, Leaflet.js, Bootstrap 3.4
- **Authentification**: Devise + CanCanCan
- **Email**: SendGrid
- **Déploiement**: Render.com

### Fonctionnalités Clés
- 🗺️ Recherche géolocalisée de commerces
- 🛒 Système de panier et commandes
- 👥 Gestion multi-rôles (marchands/acheteurs)  
- 📧 Notifications email automatiques
- 📱 Interface responsive et mobile-first

## Démarrage Rapide

```bash
# Installation des dépendances
bundle install
yarn install --check-files

# Configuration base de données
rails db:setup
rails db:migrate

# Lancement du serveur
rails server
```

## Support et Contribution

Pour toute question ou contribution, consultez les guides spécifiques dans chaque section de la documentation.