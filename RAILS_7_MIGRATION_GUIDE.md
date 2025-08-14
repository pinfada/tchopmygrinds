# Guide de Migration Rails 7.1 - TchopMyGrinds

## 🚀 Phase 1: Mise à jour Rails 6.1 → 7.1

### État actuel
- **Rails**: 6.1.7.10
- **Ruby**: 3.2.3 ✅
- **PostgreSQL**: 16.9 ✅

### Changements effectués

#### 1. Gemfile mis à jour
- ✅ Rails 6.1 → 7.1.0
- ✅ Sass-Rails 5.0 → 6.0
- ✅ JBuilder 2.5 → 2.7
- ✅ Listen 3.0.5 → 3.8
- ✅ Ajout Turbo Rails & Stimulus
- ✅ Ajout Image Processing
- ✅ Ajout Redis pour cache
- ✅ Ajout Omniauth sécurisé

#### 2. Dépendances supprimées/remplacées
- ❌ Turbolinks → Turbo Drive
- ❌ Bootstrap Sass → Tailwind CSS (déjà fait)

### Prochaines étapes

#### Étape 1: Installation des nouvelles dépendances
```bash
bundle update
```

#### Étape 2: Configuration Rails 7.1
- Mise à jour des configurations
- Migration vers credentials Rails 7
- Configuration Redis pour cache
- Configuration Turbo/Stimulus

#### Étape 3: Tests et vérifications
- Tests de régression
- Vérification geolocalisation
- Tests des fonctionnalités critiques

### ⚠️ Points d'attention

1. **Turbolinks → Turbo**: Changement de comportement JavaScript
2. **Asset Pipeline**: Vérifier compatibilité AngularJS
3. **CSRF Protection**: Nouvel Omniauth setup
4. **Cache**: Configuration Redis nécessaire

### 🔧 Commandes de migration

```bash
# 1. Backup (déjà créé)
./backup_database.sh

# 2. Mise à jour Gemfile
bundle update

# 3. Install générateurs Rails 7
rails app:update

# 4. Migration DB
rails db:migrate

# 5. Tests
rspec
```

### 📋 Checklist de validation

- [ ] Bundle update réussi
- [ ] Base de données migrée
- [ ] Tests passent
- [ ] Geolocalisation fonctionne
- [ ] Interface admin accessible
- [ ] Email system opérationnel
- [ ] Authentification Devise OK

### 🚨 Rollback si nécessaire

```bash
# Restaurer backup
gunzip backups/tchopmygrinds_backup_*.sql.gz
psql tchopmygrinds_development < backups/tchopmygrinds_backup_*.sql

# Revenir Gemfile
git checkout HEAD~1 -- Gemfile
bundle install
```

---

*Guide créé dans le cadre du Plan V2.0 de migration (viabilité 91%)*