# TchopMyGrinds - Guide de développement Claude

## 📋 Vue d'ensemble

TchopMyGrinds est une marketplace moderne spécialisée dans la vente de bananes plantain et autres produits locaux au Cameroun. L'application connecte les vendeurs (fixes et ambulants) avec les consommateurs via une interface mobile-first moderne.

## 🏗️ Architecture technique

### Stack technologique
- **Backend**: Ruby on Rails 6.0
- **Frontend**: AngularJS 1.8 avec interface moderne
- **Base de données**: SQLite3 (développement), PostgreSQL (production)
- **Cartographie**: OpenStreetMap avec Leaflet.js (remplace MapQuest)
- **Géolocalisation**: Geocoder gem + Navigator API
- **Authentification**: Devise + CanCanCan
- **Panier**: ngCart
- **Email**: SendGrid

### Nouvelles fonctionnalités 2024
1. **Interface moderne mobile-first** - Design system complet avec CSS Grid/Flexbox
2. **Cartographie OpenStreetMap** - Remplacement de MapQuest par une solution open source
3. **Recherche géolocalisée intelligente** - Rayon configurable jusqu'à 50km
4. **Système de manifestation d'intérêt** - Pour produits non disponibles
5. **UX optimisée pour banane plantain** - Interface spécialisée marketplace locale

## 🚀 Commandes de développement

### Configuration initiale
```bash
# Cloner et installer
git clone [repo-url]
cd tchopmygrinds
bundle install

# Base de données (SQLite pour dev)
rails db:create
rails db:migrate
rails db:seed

# Lancer l'application
rails server -p 3000 -b 0.0.0.0
```

### Commandes utiles
```bash
# Tests
rspec
rails test

# Console Rails
rails console

# Logs
tail -f log/development.log

# Assets (si besoin)
rails assets:precompile

# Réinitialiser la DB
rails db:drop db:create db:migrate db:seed
```

## 🎨 Nouvelle architecture UI/UX

### Design System moderne
- **Couleurs**: Palette verte axée banane plantain (#28a745)
- **Typography**: System fonts (-apple-system, BlinkMacSystemFont)
- **Composants**: Card-based, mobile-first
- **Animations**: Transitions CSS modernes, respectueuses accessibilité
- **Icônes**: Emojis + Font Awesome

### Structure des templates
```
app/assets/javascripts/Templates/
├── modern-main.html          # Interface principale modernisée
└── main.html                 # Ancienne interface (backup)

app/assets/stylesheets/
├── modern-ui.scss           # Système de design moderne
├── modern-maps.scss         # Styles cartographie
├── modern-main.scss         # Interface principale
└── application.css          # Manifest CSS
```

### Contrôleurs JavaScript
```
app/assets/partials/controllers/
├── ModernMainController.js.erb    # Contrôleur moderne
└── MainController.js.erb          # Ancien contrôleur (backup)
```

## 🗺️ Cartographie moderne

### Remplacement MapQuest → OpenStreetMap
```javascript
// Nouvelle API cartographie (modern-maps.js)
window.TchopMaps = {
    init: function(containerId, options),
    getCurrentLocation: function(),
    searchNearby: function(product, location, radius),
    showSearchResults: function(results, center, radius)
}

// Configuration tiles
TILE_SERVERS: {
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    cartodb: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
}
```

### Fonctionnalités cartographiques
- Géolocalisation haute précision
- Markers personnalisés (🏪 commerce fixe, 🚐 ambulant)
- Cercles de recherche interactifs
- Popups riches avec informations marchands
- Support offline basique

## 🔍 Recherche de produits avancée

### API endpoints
```ruby
# Recherche géolocalisée
GET /products/search_nearby
# Params: product_name, latitude, longitude, radius

# Liste produits par commerce
GET /products/listcommerce
# Params: search_name, commerce_id

# Manifestation d'intérêt
POST /product_interests
# Body: product_name, user_latitude, user_longitude, search_radius, message
```

### Algorithme de recherche
1. Géolocalisation utilisateur (précision ~10-50m)
2. Recherche dans rayon 5-50km configurable
3. Tri par distance croissante
4. Affichage stock en temps réel
5. Alternatives si aucun résultat

## 📱 Fonctionnalités modernes

### Interface mobile-first
- Touch-friendly (44px+ touch targets)
- Swipe gestures pour navigation
- Responsive breakpoints: 480px, 768px, 1024px
- PWA-ready (service workers à implémenter)

### Accessibilité (WCAG 2.1 AA)
- Navigation clavier complète
- Screen reader optimized
- High contrast mode support
- Focus management dans modals
- ARIA labels appropriés

### Performance
- Lazy loading images
- CSS Grid pour layouts
- Debounced search (300ms)
- Optimisation mobile (bundle < 500KB)

## 🏪 Gestion des commerces

### Types de commerces
1. **Sédentaires** (🏪): Position fixe, horaires réguliers
2. **Itinérants** (🚐): Position mobile, tracking GPS

### Données commerce
```ruby
# Commerce model
- nom (string)
- type: 'sedentaire'|'itinerant'
- latitude, longitude (decimal)
- ville (string)
- user_id (belongs_to user)
- products (has_many through categorizations)
```

### Interface marchands
- Dashboard avec statistiques ventes
- Gestion produits en stock
- Vue demandes clients (ProductInterest)
- Notifications push (à implémenter)

## 🛒 Système de commandes

### Flux utilisateur moderne
1. **Recherche produit** → géolocalisation → résultats triés distance
2. **Sélection marchand** → ajout panier → checkout
3. **Paiement** (intégration à prévoir: MTN Mobile Money, Orange Money)
4. **Livraison** → suivi commande → confirmation

### Panier (ngCart)
```javascript
// API panier
ngCart.addItem(id, name, price, quantity)
ngCart.removeItemById(id)
ngCart.getTotalItems()
ngCart.getSubTotal()
```

## 🔔 Manifestation d'intérêt

### Nouveau modèle ProductInterest
```ruby
# Champs principaux
- user_id
- product_name
- user_latitude, user_longitude
- search_radius (km)
- message (optionnel)
- fulfilled (boolean)
- email_sent (boolean)
```

### Workflow
1. Utilisateur recherche produit indisponible
2. Manifestation d'intérêt avec géolocalisation
3. Email automatique aux marchands de la zone
4. Notification utilisateur quand produit disponible
5. Suivi des conversions intérêt → vente

## 📧 Notifications

### Types d'emails (SendGrid)
- Confirmation manifestation d'intérêt
- Alerte marchand: nouvelle demande zone
- Notification utilisateur: produit disponible
- Confirmation commande
- Suivi livraison

### Configuration
```ruby
# config/initializers/devise.rb
config.mailer_sender = 'noreply@tchopmygrinds.com'

# Utilisation
UserMailer.interest_confirmation(user, product_interest).deliver_now
```

## 🏠 Gestion des adresses

### Modèle Address
```ruby
# Champs
- user_id
- street
- city  
- region
- country
- latitude, longitude
- is_default (boolean)
```

### Géocodage automatique
```ruby
# Dans Address model
geocoded_by :full_address
after_validation :geocode

def full_address
  "#{street}, #{city}, #{region}, #{country}"
end
```

## 🚨 Gestion d'erreurs

### Logging moderne
```ruby
# Dans controllers
Rails.logger.info "🔍 Product search: #{params[:product_name]}"
Rails.logger.error "❌ Search failed: #{e.message}"

# Frontend
console.log('🚀 Initializing Modern Interface');
console.error('❌ Search error:', error);
```

### Fallbacks gracieux
- Position par défaut: Yaoundé (3.8480, 11.5021)
- Données mock si API fails
- Offline-first approach pour features critiques

## 🔒 Sécurité et permissions

### Rôles utilisateurs (CanCanCan)
```ruby
# app/models/ability.rb
- :client - Peut commander, manifester intérêts
- :merchant - Peut créer commerces, gérer produits
- :admin - Accès total via rails_admin
```

### Validation données
- Géocodage: validation coordonnées Cameroun
- Prix: validation range raisonnable (100-50000 FCFA)
- Rayon recherche: limité à 50km max

## 📊 Analytics et monitoring

### Métriques clés à tracker
- Recherches par produit/région
- Taux conversion recherche → commande
- Performance géolocalisation
- Usage mobile vs desktop
- Manifestations d'intérêt → ventes

### Outils recommandés
- Google Analytics 4
- Sentry pour error tracking
- New Relic pour performance
- Mixpanel pour product analytics

## 🚀 Déploiement

### Environnements
- **Développement**: SQLite3, localhost:3000
- **Test**: SQLite3, variables d'env test
- **Production**: PostgreSQL, Render.com

### Variables d'environnement (.env)
```bash
SENDGRID_API_KEY=xxx
SENDGRID_DOMAIN=tchopmygrinds.com
DATABASE_URL=postgres://xxx (production)
RAILS_ENV=production
SECRET_KEY_BASE=xxx
```

### Pipeline Render.com
```yaml
# render.yaml
services:
  - type: web
    name: tchopmygrinds
    runtime: ruby
    buildCommand: bundle install; rails db:migrate; rails assets:precompile
    startCommand: rails server -p $PORT -e $RAILS_ENV
```

## 🔧 Debugging et tests

### Debugging moderne
```bash
# Rails console avec helpers
rails console
> User.merchants.near([3.848, 11.502], 10)
> Product.search_by_name("banane").with_stock

# Debug géolocalisation
> Address.geocoded.first.coordinates
> Commerce.within(10.kilometers_of([3.848, 11.502]))
```

### Tests critiques
- Géolocalisation accuracy
- Recherche performance < 2s
- Mobile touch interactions
- Offline fallbacks
- Email delivery

## 🎯 Roadmap technique

### Court terme (Q1 2024)
- [ ] Intégration paiement mobile (MTN, Orange Money)
- [ ] Notifications push web
- [ ] Cache Redis pour recherches
- [ ] Tests automatisés complets

### Moyen terme (Q2-Q3 2024)
- [ ] App mobile native (React Native)
- [ ] Système de reviews/ratings
- [ ] Chat en temps réel marchands/clients
- [ ] Analytics dashboard avancé

### Long terme (Q4 2024+)
- [ ] IA pour recommandations produits
- [ ] Optimisation logistique livraisons
- [ ] Expansion autres pays (Gabon, RCA)
- [ ] Marketplace B2B restaurateurs

## 📞 Support et maintenance

### Contacts techniques
- **Lead Dev**: [À définir]
- **DevOps**: [À définir]  
- **Product**: [À définir]

### Documentation technique
- Code commenté en français/anglais
- API documentation: Postman collection
- Architecture Decision Records (ADRs)
- User stories Trello/Notion

---

**Version**: 2.0 (Janvier 2024)  
**Dernière mise à jour**: Interface moderne + OpenStreetMap + Manifestation d'intérêt  
**Prochaine version**: 2.1 - Paiements mobiles + PWA