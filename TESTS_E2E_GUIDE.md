# 🧪 Tests E2E et Détection de Régressions - TchopMyGrinds

## 🎉 **Système Complet Implémenté !**

✅ **Infrastructure de tests E2E avec Puppeteer**  
✅ **Détection de régressions fonctionnelles et visuelles**  
✅ **Intégration CI/CD avec GitHub Actions**  
✅ **Utilisateurs de test créés automatiquement**  
✅ **Tests pour 5 fonctionnalités clés**

---

## 🚀 **Démarrage Rapide**

### 1. **Créer les données de test**
```bash
rails runner db/seeds_test_users_simple.rb
```

### 2. **Démarrer les services**
```bash
# Terminal 1 : Backend Rails
rails server -p 3000

# Terminal 2 : Frontend React  
cd frontend && npm run dev
```

### 3. **Exécuter les tests**
```bash
# Première fois (création baseline)
npm run test:baseline

# Tests normaux
npm run test:regression
```

---

## 📋 **Comptes de Test Disponibles**

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| 👨‍💼 Admin | admin@test.com | password123 |
| 🏪 Marchand | merchant@test.com | password123 |
| ✅ Marchand vérifié | verified_merchant@test.com | password123 |
| 🛒 Client | customer@test.com | password123 |
| 💰 Acheteur | test_buyer@test.com | password123 |

---

## 🧪 **Tests Implémentés**

### 1. **Authentication** (`npm run test:auth`)
- ✅ Page de connexion
- ✅ Connexion valide
- ✅ Connexion invalide  
- ✅ Déconnexion
- ✅ API d'authentification

### 2. **Commerces** (`npm run test:commerces`) 
- ✅ Recherche géolocalisée
- ✅ Filtres par catégorie
- ✅ Affichage des détails
- ✅ API commerces

### 3. **Manifestations d'Intérêt** (`test:product-interest`)
- ✅ Produits en rupture de stock
- ✅ Création de manifestations
- ✅ Tableau de bord marchand
- ✅ Notifications

### 4. **Panier et Commandes** (`test:cart-checkout`)
- ✅ Ajout au panier
- ✅ Gestion du panier
- ✅ Processus de commande
- ✅ Persistance panier

### 5. **Système d'Évaluations** (`npm run test:rating-system`)
- ✅ Affichage des notes
- ✅ Soumission d'avis
- ✅ Modération admin
- ✅ API évaluations

---

## 🔍 **Détection de Régressions**

### **Types Détectés**
- 🚨 **Fonctionnelles** : Tests qui échouent maintenant
- ⚡ **Performance** : Ralentissements significatifs
- 👁️ **Visuelles** : Changements d'interface
- 📊 **Coverage** : Diminution du nombre de tests

### **Seuils Configurés**
- Performance : +50% de temps d'exécution
- Visuel : 5% de différence screenshots
- Coverage : -10% taux de réussite

---

## 📊 **Scripts NPM Disponibles**

```bash
# Tests individuels
npm run test:auth                 # Authentification
npm run test:commerces            # Recherche commerces
npm run test:rating-system        # Évaluations
npm run test:e2e                  # Test simple (ratings)
npm run test:api                  # Tests API

# Tests complets
npm run test:full                 # Tous les tests
npm run test:regression           # Tests de régression
npm run test:baseline             # Créer/maj baseline
npm run test:ci                   # Pipeline CI

# Données de test
rails runner db/seeds_test_users_simple.rb
```

---

## 🎯 **Workflows CI/CD**

### **GitHub Actions** (`.github/workflows/e2e-tests.yml`)
- ✅ Exécution sur push/PR
- ✅ Tests en parallèle
- ✅ Rapports automatiques
- ✅ Commentaires PR
- ✅ Upload artefacts

### **Décisions de Déploiement**
- **✅ PROCEED** : Aucune régression
- **⚠️ CAUTION** : Régressions mineures  
- **🚨 BLOCK** : Régressions critiques

---

## 📁 **Fichiers et Dossiers Créés**

```
tests/
├── features/                    # Tests par fonctionnalité
│   ├── authentication.test.js   # ✅ Tests de connexion
│   ├── commerces.test.js        # ✅ Tests de recherche
│   ├── ratings.test.js          # ✅ Tests d'évaluations
│   ├── product-interest.test.js # ✅ Manifestations d'intérêt
│   └── cart-checkout.test.js    # ✅ Panier et commandes
├── config/test-config.js        # ✅ Configuration
├── utils/test-helpers.js        # ✅ Fonctions d'aide
├── regression-detector.js       # ✅ Détection régressions
├── visual-regression-detector.js # ✅ Régressions visuelles
├── test-runner.js               # ✅ Runner principal
├── run-regression-tests.js      # ✅ Script régression
└── ci-pipeline.js               # ✅ Pipeline CI

.github/workflows/e2e-tests.yml  # ✅ GitHub Actions
.env.test                        # ✅ Variables d'environnement
db/seeds_test_users_simple.rb    # ✅ Données de test
```

---

## 🛠️ **Résolution de Problèmes**

### **Services non démarrés**
```bash
# Vérifier backend
curl http://localhost:3000/api/v1/commerces

# Vérifier frontend  
curl http://localhost:3001
```

### **Recréer les données de test**
```bash
rails runner db/seeds_test_users_simple.rb
```

### **Mode debug**
```bash
export PUPPETEER_HEADLESS=false
npm run test:auth
```

---

## 🎯 **Prochaines Étapes**

1. ✅ **Données de test créées**
2. ✅ **Infrastructure complète**
3. ✅ **Tests fonctionnels**
4. ✅ **Détection de régressions**

### **Pour commencer :**

```bash
# 1. Créer les données
rails runner db/seeds_test_users_simple.rb

# 2. Démarrer les services (2 terminaux)
rails server -p 3000
cd frontend && npm run dev

# 3. Lancer le premier test
npm run test:baseline
```

---

## 📞 **Support et Documentation**

- **Configuration** : `.env.test`
- **Logs** : `test-reports/`
- **Screenshots** : `test-screenshots/`
- **Artefacts CI** : `test-artifacts/`

**Le système est prêt à utiliser ! 🚀**