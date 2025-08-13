# TchopMyGrinds

Une plateforme e-commerce géolocalisée connectant les marchands locaux avec leurs clients dans un rayon de 50km.

## 🎯 Vue d'ensemble

TchopMyGrinds est une application web qui permet aux utilisateurs de découvrir et d'acheter des produits auprès de commerçants locaux basés sur leur géolocalisation. La plateforme propose une expérience de commerce de proximité avec cartographie interactive et gestion complète des commandes.

## 🏗️ Architecture technique

### Backend (Ruby on Rails 6.0)
- **Framework**: Ruby on Rails avec architecture MVC
- **Base de données**: PostgreSQL avec capacités spatiales
- **Authentification**: Devise avec autorisation basée sur les rôles (CanCanCan)
- **Géolocalisation**: Gem Geocoder pour les recherches par proximité
- **Email**: Intégration SendGrid pour les notifications
- **Administration**: Interface RailsAdmin pour la gestion backend

### Frontend (AngularJS 1.8)
- **Framework**: AngularJS en Single Page Application (SPA)
- **Cartographie**: Leaflet.js avec marqueurs personnalisés
- **UI**: Bootstrap 3.4.1 avec styles SCSS personnalisés
- **Panier**: Module ngCart pour la gestion du shopping
- **Templates**: Système de templates modulaires avec Asset Pipeline Rails

## 👥 Types d'utilisateurs

1. **Itinerant** - Marchands mobiles
2. **Sedentary** - Commerçants à emplacement fixe
3. **Others** - Acheteurs réguliers

## 🌟 Fonctionnalités principales

### Pour les acheteurs
- **Découverte géolocalisée** : Trouvez des commerces dans un rayon de 50km
- **Navigation interactive** : Carte avec marqueurs des commerces disponibles
- **Catalogue de produits** : Parcourez les produits par commerçant
- **Panier d'achat** : Ajoutez et gérez vos articles
- **Commandes** : Passez commande avec suivi du statut
- **Notifications** : Recevez des emails de confirmation et de suivi

### Pour les marchands
- **Gestion du commerce** : Créez et gérez votre profil commerçant
- **Inventaire** : Ajoutez et mettez à jour vos produits
- **Géolocalisation** : Définissez votre position pour être visible aux clients
- **Commandes** : Recevez et traitez les commandes clients
- **Interface d'administration** : Accès aux outils de gestion via RailsAdmin

### Fonctionnalités système
- **Recherche par proximité** : Algorithme de géolocalisation intelligent
- **Cartographie temps réel** : Visualisation des commerces sur carte interactive
- **Système de commandes** : Workflow complet de la commande à la livraison
- **Notifications automatiques** : Emails transactionnels pour toutes les étapes

## 🛠️ Installation et développement

### Prérequis
- Ruby 2.7+
- Rails 6.0+
- PostgreSQL
- Node.js et Yarn
- Bundler

### Configuration locale

```bash
# Cloner le repository
git clone [votre-repo-url]
cd tchopmygrinds

# Installer les dépendances
bundle install
yarn install --check-files

# Configuration de la base de données
rails db:setup
rails db:migrate
rails db:seed

# Lancer l'application
rails server
```

L'application sera accessible sur `http://localhost:3000`

### Tests

```bash
# Lancer la suite de tests RSpec
rspec

# Test d'un fichier spécifique
rspec spec/controllers/pages_controller_spec.rb
```

## 🚀 Déploiement

### Render.com
Le projet est configuré pour le déploiement sur Render.com :

```bash
# Script de build automatique
./bin/render-build.sh
```

**Variables d'environnement requises :**
- `SECRET_KEY_BASE` - Clé secrète Rails pour la production
- `DATABASE_URL` - URL de connexion PostgreSQL
- `RAILS_MASTER_KEY` - Clé maître pour les credentials

### Commandes de production

```bash
# Précompilation des assets
bundle exec rails assets:precompile

# Nettoyage des anciens assets
bundle exec rails assets:clean

# Migrations
bundle exec rails db:migrate
```

## 🗂️ Structure des fichiers principaux

```
app/
├── controllers/
│   ├── commerces_controller.rb    # Gestion des commerces
│   ├── products_controller.rb     # Catalogue produits
│   ├── orders_controller.rb       # Processus de commande
│   └── pages_controller.rb        # Pages principales et utilitaires
├── models/
│   ├── user.rb                    # Utilisateurs avec rôles
│   ├── commerce.rb                # Commerces avec géolocalisation
│   ├── product.rb                 # Produits et inventaire
│   └── order.rb                   # Commandes et workflow
├── assets/javascripts/
│   ├── app.js.erb                 # Module AngularJS principal
│   ├── controllers/               # Contrôleurs frontend
│   ├── services/                  # Services AngularJS
│   └── Templates/                 # Templates HTML
└── views/
    ├── layouts/
    └── user_mailer/               # Templates d'emails
```

## 🔧 Tâches Rake personnalisées

```bash
# Gestion des adresses
rake address_tasks:*

# Opérations email
rake email_tasks:*

# Gestion des utilisateurs
rake user_tasks:*
```

## 📧 Système de notifications

- **Confirmations de commande** : Email automatique lors de la validation
- **Suivi de statut** : Notifications à chaque changement d'état
- **Newsletter** : Système d'abonnement disponible
- **Notifications marchands** : Alertes pour nouvelles commandes

## 🗺️ Intégration cartographique

- **Leaflet.js** : Cartographie interactive responsive
- **Marqueurs personnalisés** : Différenciation visuelle des types de commerce
- **Géolocalisation browser** : Détection automatique de la position utilisateur
- **Calcul de distances** : Affichage des distances en temps réel
- **Zoom et navigation** : Contrôles de carte intuitifs

## 🔒 Sécurité et autorisations

- **Authentification Devise** : Système de connexion sécurisé
- **Autorisations CanCanCan** : Contrôle d'accès basé sur les rôles
- **Protection CSRF** : Sécurisation des formulaires
- **Validation des données** : Contrôles côté serveur et client

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/ma-feature`)
3. Committez vos changements (`git commit -am 'Ajout de ma feature'`)
4. Push vers la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence [spécifiez votre licence].

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation dans `CLAUDE.md`
- Vérifiez les logs de l'application

---

*TchopMyGrinds - Connecter les communautés locales à travers le commerce de proximité* 🛍️ 🗺️