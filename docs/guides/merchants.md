# Guide Utilisateur - Marchands

## Vue d'ensemble

En tant que marchand sur TchopMyGrinds, vous pouvez créer et gérer vos commerces, ajouter des produits, et suivre vos commandes. Ce guide vous accompagne dans l'utilisation complète de la plateforme.

## Inscription et Configuration du Compte

### Création de Compte Marchand

1. **Inscription initiale**
   - Cliquer sur "S'inscrire" depuis la page d'accueil
   - Remplir les informations personnelles :
     - Email (unique et valide)
     - Mot de passe (minimum 6 caractères)
     - Nom complet
   
2. **Sélection du type de marchand**
   - **Itinérant** : Pour food trucks, marchés ambulants
   - **Sédentaire** : Pour boutiques fixes, restaurants

3. **Activation des rôles**
   - ✅ Rôle Vendeur (obligatoire pour les marchands)
   - ✅ Rôle Acheteur (optionnel, pour acheter chez d'autres marchands)

### Configuration du Profil

```
Menu Utilisateur → Mon Profil
```

- **Informations personnelles** : Nom, email, téléphone
- **Type de marchand** : Itinérant/Sédentaire (modifiable)
- **Préférences** : Notifications email, newsletter

## Gestion des Commerces

### Création d'un Nouveau Commerce

1. **Accès à la gestion**
   ```
   Menu Principal → Mes Commerces → Nouveau Commerce
   ```

2. **Informations obligatoires**
   - **Nom du commerce** : Nom visible par les clients
   - **Ville** : Obligatoire pour la géolocalisation
   - **Description** : Présentation de votre commerce

3. **Informations optionnelles**
   - **Adresse complète** : Améliore la précision géographique
   - **Téléphone** : Contact direct pour les clients

4. **Géolocalisation automatique**
   - Le système géocode automatiquement l'adresse
   - Vérification des coordonnées sur la carte
   - Correction manuelle si nécessaire

### Modification d'un Commerce Existant

```
Mes Commerces → [Sélectionner Commerce] → Modifier
```

**Attention** : La modification de l'adresse relance le géocodage automatique.

### Types de Commerce

#### Commerce Itinérant (Mobile)
- **Avantages** : Flexibilité de localisation
- **Inconvénients** : Clients doivent vérifier votre position
- **Recommandations** :
  - Mettre à jour régulièrement la position
  - Indiquer les horaires et lieux habituels
  - Utiliser la description pour les itinéraires

#### Commerce Sédentaire (Fixe)  
- **Avantages** : Position stable, facilite la livraison
- **Inconvénients** : Zone de chalandise limitée
- **Recommandations** :
  - Adresse précise et complète
  - Photos du commerce dans la description
  - Horaires d'ouverture clairs

## Gestion du Catalogue Produits

### Ajout de Produits

1. **Navigation**
   ```
   Mes Commerces → [Commerce] → Produits → Ajouter Produit
   ```

2. **Informations produit**
   - **Nom** : Descriptif et attrayant
   - **Description** : Détails, origine, particularités
   - **Prix unitaire** : En euros, avec 2 décimales
   - **Stock disponible** : Quantité actuelle
   - **Stock en commande** : Réapprovisionnement prévu

### Gestion du Stock

#### Mise à Jour des Stocks
```
Produits → [Sélectionner Produit] → Modifier
```

- **Stock disponible** : Visible par les clients
- **Stock en commande** : Pour votre gestion interne
- **Rupture de stock** : Produit masqué automatiquement si stock = 0

#### Stratégies de Stock

**Stock Faible (< 5 unités)**
- Considérer le réapprovisionnement
- Utiliser "Stock en commande" pour planifier

**Stock Élevé**
- Envisager des promotions
- Vérifier la rotation des produits

**Produits Périssables**
- Mise à jour quotidienne recommandée
- Utiliser la description pour la fraîcheur

### Association Commerce-Produits

- **Un produit** peut être vendu par **plusieurs commerces**
- **Avantage** : Mutualisation du catalogue
- **Exemple** : "Tomates Bio" vendu par 3 maraîchers différents

#### Ajouter un Produit Existant
1. Rechercher dans le catalogue global
2. Ajouter à votre commerce
3. Définir votre prix et stock spécifique

## Gestion des Commandes

### Réception des Commandes

#### Notifications
- **Email automatique** à chaque nouvelle commande
- **Statut initial** : "En attente" (Waiting)

#### Informations Commande
- **Client** : Nom et coordonnées
- **Produits** : Liste détaillée avec quantités
- **Total** : Montant de la commande
- **Date** : Horodatage de la commande

### Workflow de Traitement

#### 1. Commande Reçue (Waiting)
```
Actions disponibles :
- Accepter la commande
- Refuser/Annuler (si stock insuffisant)
```

#### 2. Commande Acceptée (Accepted)
```
Actions :
- Marquer "En préparation" 
- Estimer délai de préparation
```

#### 3. En Préparation (In_Progress)
```
Actions :
- Préparer les produits
- Marquer "Prête pour expédition"
```

#### 4. Expédition (Shipped)
```
Actions :
- Confirmer l'expédition/livraison
- Fournir informations de suivi si applicable
```

#### 5. Livraison (Delivered)
```
Actions :
- Confirmer la réception par le client
- Marquer "Terminée"
```

#### 6. Terminée (Completed)
```
- Commande archivée
- Statistiques de vente mises à jour
```

### Gestion des Annulations

#### Annulation par le Marchand
- **Possible** : Statuts Waiting, Accepted
- **Raisons courantes** :
  - Stock insuffisant
  - Problème qualité produit
  - Indisponibilité temporaire

#### Annulation par le Client
- **Possible** : Statuts Waiting, Accepted (selon délai)
- **Impact** : Remise en stock automatique

## Suivi des Performances

### Statistiques de Vente

```
Tableau de Bord → Mes Statistiques
```

#### Métriques Disponibles
- **Commandes par période** : Jour, semaine, mois
- **Chiffre d'affaires** : Total et par produit
- **Produits populaires** : Ventes par quantité
- **Clients récurrents** : Fidélisation

#### Analyse Géographique
- **Zone de chalandise** : Répartition géographique des clients
- **Distance moyenne** : Rayon d'action de votre commerce
- **Densité de commandes** : Secteurs les plus actifs

### Optimisation des Ventes

#### Amélioration du Référencement
- **Description détaillée** : Mots-clés pertinents
- **Mise à jour régulière** : Stock et informations
- **Réactivité** : Traitement rapide des commandes

#### Stratégies Commerciales
- **Gamme de produits** : Diversification selon la demande
- **Prix compétitifs** : Comparaison avec autres marchands
- **Qualité de service** : Rapidité et fiabilité

## Interface Mobile et Géolocalisation

### Utilisation Mobile

#### Marchands Itinérants
- **Mise à jour position** : Régulière via GPS
- **Notification clients** : Changement de localisation
- **Planning** : Informer des prochains emplacements

#### Gestion à Distance
- **Consultation commandes** : Via smartphone/tablette
- **Mise à jour stocks** : En temps réel
- **Communication clients** : Réponse rapide aux questions

### Optimisation Géographique

#### Zone de Livraison
- **Définir un périmètre** : Distance max de livraison
- **Frais de port** : Selon distance (à implémenter)
- **Créneaux de livraison** : Organisation logistique

## Bonnes Pratiques

### Communication Client

#### Descriptions Produits
```
❌ "Pommes"
✅ "Pommes Golden bio, production locale, cueillies cette semaine"
```

#### Gestion des Commandes
- **Délais réalistes** : Estimation précise des temps
- **Communication proactive** : Informer des retards
- **Qualité constante** : Respect des standards annoncés

### Gestion Financière

#### Suivi des Revenus
- **Export des données** : Commandes par période
- **Calcul marges** : Prix de vente vs coût d'achat
- **Déclaration fiscale** : Conservation des données

#### Optimisation Coûts
- **Mutualisation transport** : Groupage livraisons
- **Gestion stocks** : Éviter pertes et surstockage
- **Efficacité logistique** : Optimisation des tournées

## Support et Assistance

### Problèmes Courants

#### Géolocalisation Incorrecte
```
Solution :
1. Vérifier l'adresse saisie
2. Utiliser format : "N° rue, ville, code postal"
3. Contacter support si persistance
```

#### Commandes Non Reçues
```
Vérification :
1. Email dans spams/courrier indésirable
2. Notifications activées dans le profil
3. Connexion internet stable
```

#### Stock Non Mis à Jour
```
Actions :
1. Actualiser la page
2. Vérifier modification sauvegardée
3. Réessayer après quelques minutes
```

### Contact Support

- **Email** : support@tchopmygrinds.com
- **Heures** : Lundi-Vendredi 9h-18h
- **Délai réponse** : 24-48h ouvrées

Ce guide vous permet d'exploiter pleinement les fonctionnalités marchandes de TchopMyGrinds pour développer votre activité locale.