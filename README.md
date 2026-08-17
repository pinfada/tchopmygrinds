# TchopMyGrinds

[![Try with railsbox](https://pinfada.github.io/tchopmygrinds/badge.svg)](https://pinfada.github.io/tchopmygrinds/)

Une plateforme e-commerce géolocalisée connectant les marchands locaux avec leurs clients dans un rayon de 50km.

**Essayer sans rien installer → [pinfada.github.io/tchopmygrinds](https://pinfada.github.io/tchopmygrinds/)**

## 🎯 Vue d'ensemble

TchopMyGrinds est une application web qui permet aux utilisateurs de découvrir et d'acheter des produits auprès de commerçants locaux basés sur leur géolocalisation. La plateforme propose une expérience de commerce de proximité avec cartographie interactive et gestion complète des commandes.

## 🎮 Démo en ligne

La démonstration est une sandbox [railsbox](https://github.com/pinfada/railsbox) : Rails, Puma et
PostgreSQL tournent dans une VM Linux i386 émulée **dans l'onglet du visiteur**. Aucun serveur,
aucune inscription, aucun coût — chaque visiteur apporte le sien. Comptez 20 à 30 secondes de
démarrage, puis `F5` pour repartir d'une copie neuve.

### Comptes de démonstration

La base est pré-peuplée par `db/seeds_api.rb`. Tous les comptes partagent le mot de passe
`password123` :

| Rôle | Identifiant |
| --- | --- |
| Acheteur | `client1@test.com` |
| Commerçant itinérant | `marie.plantain@test.com` |
| Commerçant sédentaire | `grace.epicerie@test.com` |
| Administrateur | `admin@tchopmygrinds.com` |

`railsbox.yml` ouvre une **session Rails** pour `client1@test.com` dès le premier chargement, ce
qui profite aux surfaces rendues côté serveur (RailsAdmin notamment). L'authentification du SPA
React repose en revanche sur un **JWT stocké côté navigateur** : l'interface React démarre donc
déconnectée et attend un passage explicite par l'écran de connexion.

Ces identifiants sont **publics par conception** : tout ce qui entre dans une sandbox est
téléchargeable (image disque et instantané mémoire). N'y embarquez jamais de secret ni de donnée
réelle — voir [SECURITY.md](SECURITY.md).

### Ce qui ne fonctionne pas dans la sandbox

La VM n'a **aucun réseau sortant**. Concrètement :

- les **tuiles OpenStreetMap ne se chargent pas** — la carte Leaflet reste vide, seuls les
  marqueurs et les distances calculées côté serveur sont exploitables ;
- les emails (SendGrid) et le géocodage d'adresses nouvellement saisies sont inopérants ;
- ActionCable / WebSockets sont hors périmètre de railsbox.

Le reste du parcours — découverte des commerces, catalogue, panier, commandes, manifestations
d'intérêt — est servi normalement par la VM.

### Publier ou republier la démo

Le workflow [`.github/workflows/sandbox.yml`](.github/workflows/sandbox.yml) reconstruit la sandbox
à chaque push sur `master` (~9 min) et republie la branche `gh-pages`, servie par GitHub Pages.
Sa configuration vit dans [`railsbox.yml`](railsbox.yml).

> **Le bundle React versionné fait foi.** railsbox n'exporte que `public/assets/` et
> `app/assets/builds/` depuis son étage de compilation : la sortie Vite (`public/dist/`) n'y passe
> pas et c'est la version **commitée** qui est embarquée dans l'image. Lancez `npm run build:react`
> et commitez `public/dist/` avant de pousser, sinon la démo affiche une interface périmée.

**Première mise en service** : pousser sur `master` une première fois pour que le workflow crée la
branche `gh-pages`, puis activer *Settings → Pages → Source : Deploy from a branch → `gh-pages` /
`(root)`*. La branche `gh-pages` est **entièrement remplacée** à chaque construction.

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