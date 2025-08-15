# TchopMyGrinds

Une plateforme e-commerce géolocalisée connectant les marchands locaux avec leurs clients dans un rayon de 50km.

## 🎯 Vue d'ensemble

TchopMyGrinds est une application web qui permet aux utilisateurs de découvrir et d'acheter des produits auprès de commerçants locaux basés sur leur géolocalisation. La plateforme propose une expérience de commerce de proximité avec cartographie interactive et gestion complète des commandes.

## 🏗️ Architecture technique

### Backend (Ruby on Rails 7.1.5)
- **API Architecture**: RESTful API avec namespace `/api/v1`
- **Base de données**: SQLite (dev) / PostgreSQL (prod) avec capacités spatiales
- **Authentification**: Devise-JWT pour l'authentification par tokens
- **Géolocalisation**: Gem Geocoder pour les recherches par proximité
- **Email**: Intégration SendGrid pour les notifications
- **Administration**: Interface RailsAdmin pour la gestion backend
- **CORS**: Configuration pour intégration React

### Frontend (React 18 + TypeScript)
- **Framework**: React avec TypeScript et Vite comme build tool
- **État global**: Redux Toolkit avec 7 slices spécialisés
- **Cartographie**: Leaflet.js avec marqueurs personnalisés et suivi temps réel
- **UI**: Tailwind CSS avec composants modernes et responsive
- **Panier**: Gestion Redux avec persistance localStorage
- **API**: Client Axios avec intercepteurs JWT et gestion d'erreurs

## 👥 Types d'utilisateurs

1. **Itinerant** - Marchands mobiles
2. **Sedentary** - Commerçants à emplacement fixe
3. **Others** - Acheteurs réguliers

## 🌟 Fonctionnalités principales

### Pour les acheteurs
- **Découverte géolocalisée** : Trouvez des commerces dans un rayon configurable (5-100km)
- **Navigation interactive** : Carte Leaflet avec marqueurs distincts par type de commerce
- **Catalogue de produits** : Parcourez les produits avec recherche et filtres avancés
- **Panier d'achat** : Gestion complète avec persistance automatique
- **Commandes** : Processus de commande moderne avec JWT
- **Interface responsive** : Optimisé mobile avec sidebar collapsible

### Pour les marchands
- **Types de commerce** : Support pour commerces fixes 🏪 et ambulants 🚚
- **Suivi temps réel** : Trackng GPS pour marchands itinérants avec intervalles configurables
- **Gestion du commerce** : API complète pour profil et géolocalisation
- **Inventaire** : Gestion produits avec stock et statut de disponibilité
- **Commandes** : Réception et traitement via interface moderne
- **Tableau de bord** : Accès RailsAdmin pour gestion avancée

### Fonctionnalités système avancées
- **Suivi temps réel** : Tracking automatique des commerces ambulants
- **Auto-refresh** : Mise à jour automatique configurable (5-60 minutes)
- **Paramètres utilisateur** : Configuration personnalisable des préférences carte
- **API REST moderne** : Architecture découplée avec JWT
- **Performance optimisée** : Code splitting et lazy loading React
- **TypeScript** : Sécurité de type pour réduire les erreurs

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