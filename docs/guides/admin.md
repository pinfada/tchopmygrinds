# Guide Administrateur - TchopMyGrinds

## Accès Administration

### Interface RailsAdmin

**URL d'accès** : `/admin` (depuis l'application principale)

**Prérequis** :
- Compte utilisateur avec `admin: true`
- Authentification Devise active

```ruby
# Création d'un admin via console Rails
rails console
user = User.find_by(email: 'admin@example.com')
user.update(admin: true)
```

### Navigation Principale

```
Dashboard Principal
├── Users (Utilisateurs)
├── Commerces
├── Products (Produits)  
├── Orders (Commandes)
├── OrderDetails (Détails commandes)
├── Addresses (Adresses)
├── Categorizations (Liaisons)
└── Newsletters
```

## Gestion des Utilisateurs

### Vue d'ensemble Users

#### Filtres Disponibles
- **Rôle** : Admin, Seller, Buyer
- **Type** : Itinerant, Sedentary, Others
- **Statut** : Actif/Inactif
- **Date d'inscription** : Période

#### Actions de Masse
```
Sélection multiple → Actions :
- Activer/Désactiver comptes
- Export CSV
- Suppression (avec confirmation)
```

### Gestion Individuelle

#### Informations Utilisateur
```
Fiche Utilisateur :
- Données personnelles (nom, email)
- Rôles et permissions
- Statistiques d'activité
- Historique connexions
```

#### Modification des Rôles
```
Modification Utilisateur :
☐ admin (Accès administrateur)
☐ seller_role (Peut créer commerces)
☐ buyer_role (Peut passer commandes)
```

**Attention** : Un utilisateur peut cumuler plusieurs rôles.

#### Gestion des Comptes Problématiques

**Suspension temporaire :**
```ruby
# Via console Rails
user = User.find(id)
user.update(status: false) # Désactive le compte
```

**Réactivation :**
```ruby
user.update(status: true) # Réactive le compte
```

### Statistiques Utilisateurs

#### Métriques Clés
- **Inscriptions par période** : Croissance de la base
- **Répartition des rôles** : Marchands vs Acheteurs  
- **Taux d'activation** : Comptes actifs vs inactifs
- **Connexions récentes** : Activité utilisateurs

```ruby
# Console Rails - Statistiques rapides
puts "=== Statistiques Utilisateurs ==="
puts "Total: #{User.count}"
puts "Actifs: #{User.where(status: true).count}"
puts "Admins: #{User.where(admin: true).count}"
puts "Vendeurs: #{User.where(seller_role: true).count}"
puts "Acheteurs: #{User.where(buyer_role: true).count}"
```

## Gestion des Commerces

### Monitoring des Commerces

#### Validation des Informations
- **Géolocalisation** : Vérifier cohérence adresse/coordonnées
- **Informations complètes** : Nom, ville, description
- **Propriétaire valide** : Utilisateur avec seller_role

#### Commerces Problématiques
```
Filtres Problèmes :
- Sans géolocalisation (latitude/longitude null)
- Sans produits associés  
- Propriétaire inactif
- Informations incomplètes
```

### Actions Administrateur

#### Modération du Contenu
- **Descriptions** : Vérifier pertinence et respect des règles
- **Noms commerciaux** : Éviter doublons et noms trompeurs
- **Géolocalisation** : Corriger positions erronées

#### Suppression de Commerce
```
Attention : Impact sur :
- Produits associés (via Categorizations)
- Commandes en cours
- Historique des ventes
```

**Procédure recommandée :**
1. Vérifier absence commandes en cours
2. Notifier le marchand
3. Archive avant suppression définitive

### Géolocalisation Administrative

#### Diagnostic Géographique
```ruby
# Console Rails - Commerces sans géolocalisation
Commerce.where(latitude: nil).or(Commerce.where(longitude: nil)).each do |c|
  puts "Commerce #{c.id}: #{c.nom} - #{c.ville}"
  puts "Adresse: #{c.adresse}"
  
  # Tentative géocodage
  c.geocode
  if c.save
    puts "✅ Géocodé: #{c.latitude}, #{c.longitude}"
  else
    puts "❌ Échec géocodage"
  end
  puts "---"
end
```

#### Correction Manuelle
```
Interface Admin → Commerce → Modifier :
- Latitude : Coordonnée décimale
- Longitude : Coordonnée décimale
- Vérification sur carte recommandée
```

## Gestion des Produits

### Catalogue Global

#### Vue d'ensemble
- **Produits totaux** : Nombre d'entrées catalogue
- **Produits actifs** : Avec stock > 0
- **Produits orphelins** : Sans commerce associé
- **Doublons potentiels** : Noms similaires

#### Maintenance du Catalogue

**Fusion de produits similaires :**
```ruby
# Exemple : Fusion "Tomate" et "Tomates"
product1 = Product.find_by(nom: "Tomate")
product2 = Product.find_by(nom: "Tomates")

# Transférer les categorizations
product2.categorizations.update_all(product_id: product1.id)

# Supprimer le doublon
product2.destroy
```

**Nettoyage produits orphelins :**
```ruby
# Produits sans commerce
orphaned = Product.left_joins(:categorizations)
                 .where(categorizations: { id: nil })
                 
puts "Produits orphelins: #{orphaned.count}"
# Décision : supprimer ou réassigner
```

### Modération du Contenu

#### Descriptions de Produits
- **Qualité** : Descriptions informatives
- **Exactitude** : Prix et stocks cohérents
- **Légalité** : Respect réglementation alimentaire

#### Prix et Stocks
- **Prix cohérents** : Éviter prix aberrants
- **Stocks négatifs** : Correction des erreurs
- **Produits périmés** : Retrait si nécessaire

## Gestion des Commandes

### Monitoring Global

#### Tableaux de Bord
```
Métriques Commandes :
- Commandes par statut
- Chiffre d'affaires par période
- Temps moyen de traitement
- Taux d'annulation
```

#### Commandes Problématiques
```
Filtres d'alerte :
- En attente > 24h
- Bloquées sur un statut
- Montant anormalement élevé
- Réclamations clients
```

### Intervention Administrative

#### Déblocage de Commandes
```
Situations typiques :
1. Marchand absent/indisponible
2. Problème technique
3. Litige client-marchand
```

**Actions possibles :**
- Changement manuel du statut
- Annulation avec remboursement
- Transfert vers autre marchand

#### Gestion des Litiges
```
Procédure :
1. Écouter les deux parties
2. Vérifier historique des échanges
3. Décision équitable
4. Application de la décision
5. Suivi satisfaction
```

### Statistiques Avancées

#### Analyse des Performances
```sql
-- Requêtes SQL utiles pour analytics

-- Commandes par statut et période
SELECT status, COUNT(*) as count, AVG(created_at - orderdate) as avg_processing_time
FROM orders 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY status;

-- Top marchands par CA
SELECT u.name, c.nom, SUM(od.quantity * od.unitprice) as ca
FROM users u
JOIN commerces c ON u.id = c.user_id
JOIN categorizations cat ON c.id = cat.commerce_id
JOIN products p ON cat.product_id = p.id
JOIN orderdetails od ON p.id = od.product_id
JOIN orders o ON od.order_id = o.id
WHERE o.status IN ('Delivered', 'Completed')
GROUP BY u.id, c.id
ORDER BY ca DESC
LIMIT 10;
```

## Administration Système

### Maintenance Base de Données

#### Tâches Périodiques
```bash
# Via rake tasks
rails maintenance:cleanup_sessions
rails maintenance:cleanup_abandoned_orders  
rails maintenance:check_geocoding
rails maintenance:stats
```

#### Monitoring Santé
```ruby
# Script de vérification système
namespace :admin do
  task health_check: :environment do
    checks = []
    
    # Vérifier intégrité données
    orphaned_orders = Order.left_joins(:user).where(users: { id: nil })
    checks << "❌ #{orphaned_orders.count} commandes orphelines" if orphaned_orders.any?
    
    # Vérifier géolocalisation  
    unlocated = Commerce.where(latitude: nil).or(Commerce.where(longitude: nil))
    checks << "⚠️  #{unlocated.count} commerces sans géolocalisation" if unlocated.any?
    
    # Vérifier stocks négatifs
    negative_stock = Product.where('unitsinstock < 0')
    checks << "❌ #{negative_stock.count} stocks négatifs" if negative_stock.any?
    
    puts checks.any? ? checks.join("\n") : "✅ Système en bon état"
  end
end
```

### Gestion des Emails

#### Monitoring SendGrid
```ruby
# Vérification configuration email
Rails.application.configure do
  # Test envoi email admin
  AdminMailer.system_report(
    to: 'admin@tchopmygrinds.com',
    stats: system_stats
  ).deliver_now
end
```

#### Templates d'Emails
- **Vérifier** : Tous les emails automatiques fonctionnent
- **Personnaliser** : Messages selon besoins
- **Tester** : Envois dans différents clients email

### Monitoring Performance

#### Métriques Serveur
- **Temps de réponse** : Pages principales
- **Utilisation mémoire** : Limits Render.com
- **Erreurs 500** : Fréquence et causes
- **Trafic** : Pics d'utilisation

#### Optimisations
```ruby
# Requêtes lentes - identification
ActiveRecord::Base.logger = Logger.new(STDOUT)

# Cache problématique - clearance
Rails.cache.clear

# Assets - recompilation
rails assets:precompile RAILS_ENV=production
```

## Sécurité et Modération

### Contrôle des Accès

#### Audit des Permissions
```ruby
# Vérifier cohérence rôles
User.where(seller_role: false).joins(:commerces).distinct.each do |user|
  puts "⚠️  Utilisateur #{user.email} a des commerces mais pas seller_role"
  user.update(seller_role: true)
end
```

#### Surveillance Activité Suspecte
- **Créations en masse** : Commerces/produits
- **Prix aberrants** : Produits très chers/gratuits  
- **Commandes répétitives** : Même utilisateur/pattern

### Modération du Contenu

#### Règles de Validation
```ruby
# Validation contenu sensible
def moderate_content(text)
  forbidden_words = ['spam', 'fake', 'arnaque']
  
  if forbidden_words.any? { |word| text.downcase.include?(word) }
    flag_for_review
  end
end
```

#### Signalements Utilisateurs
- **Interface de signalement** : À implémenter
- **Traitement des rapports** : Processus de modération
- **Actions correctives** : Suppression/modification/avertissement

## Rapports et Analytics

### Rapports Automatisés

#### Export de Données
```ruby
# lib/tasks/reports.rake
namespace :reports do
  task monthly_stats: :environment do
    report = {
      period: Date.current.beginning_of_month..Date.current.end_of_month,
      new_users: User.where(created_at: period).count,
      new_commerces: Commerce.where(created_at: period).count,
      orders_total: Order.where(created_at: period).count,
      revenue: calculate_revenue(period)
    }
    
    # Export CSV ou email
    ReportMailer.monthly_report(report).deliver_now
  end
end
```

#### Tableaux de Bord
- **Dashboard principal** : Métriques temps réel
- **Rapports périodiques** : Mensuel/trimestriel
- **Alertes automatiques** : Seuils critiques

### Business Intelligence

#### Analyses Géographiques
```ruby
# Répartition géographique des utilisateurs
def geographic_distribution
  Commerce.joins(:user)
          .group(:ville)
          .group('users.statut_type')
          .count
end

# Zones les plus actives
def top_zones_by_orders
  # Analyse basée sur adresses de livraison
  Address.joins(user: :orders)
         .group(:city)
         .order('COUNT(orders.id) DESC')
         .limit(10)
end
```

#### Tendances Temporelles  
- **Saisonnalité** : Produits/commandes par saison
- **Jours/heures** : Pics d'activité
- **Croissance** : Évolution mensuelle

## Maintenance Préventive

### Procédures Régulières

#### Hebdomadaire
- Vérification géolocalisation nouveaux commerces
- Modération contenu récent
- Analyse commandes problématiques

#### Mensuelle  
- Nettoyage données orphelines
- Mise à jour statistiques
- Vérification performances

#### Trimestrielle
- Audit sécurité complet
- Optimisation base de données
- Révision procédures

### Documentation des Incidents

#### Suivi des Problèmes
```markdown
# Template rapport incident
## Date/Heure
## Problème constaté  
## Impact utilisateurs
## Cause identifiée
## Solution appliquée
## Mesures préventives
```

L'administration efficace de TchopMyGrinds assure la qualité du service et la satisfaction des utilisateurs marchands et acheteurs.