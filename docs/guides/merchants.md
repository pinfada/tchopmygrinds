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

## Dashboard des Manifestations d'Intérêt

### Qu'est-ce que le Dashboard Manifestations d'Intérêt ?

Le dashboard vous permet de voir quels produits vos clients recherchent et de les notifier lorsque vous les avez en stock. C'est un outil puissant pour adapter votre offre à la demande réelle.

### Accès au Dashboard

```
Menu Principal → Manifestations d'intérêt → Onglet "Dashboard marchand"
```

**Prérequis** : Compte marchand avec `statut_type` "itinerant" ou "sedentary"

### Interface du Dashboard

#### Vue d'ensemble
Le dashboard affiche toutes les manifestations d'intérêt pour des produits correspondant à votre catalogue, groupées par nom de produit.

#### Informations Affichées

**Pour chaque produit recherché** :
- **Nom du produit** : Ce que cherchent les clients
- **Nombre de personnes intéressées** : Demande totale
- **Produits en stock correspondants** : Vos produits qui matchent
- **Liste des clients intéressés** :
  - Nom et email du client
  - Distance depuis votre commerce
  - Message avec préférences détaillées
  - Date de la manifestation

#### Configuration du Rayon
- **Sélecteur de rayon** : 25km, 50km, 75km, 100km
- **Impact** : Définit la portée des notifications que vous envoyez
- **Recommandation** : Adapter selon votre zone de livraison

### Workflow de Notification

#### 1. Identifier les Opportunités
```
Dashboard → Rechercher les produits avec :
- ✅ Produits en stock correspondants (badge vert)
- 👥 Plusieurs clients intéressés
- 📍 Clients dans votre zone de livraison
```

#### 2. Analyser la Demande
Pour chaque produit, examinez :
- **Messages clients** : Préférences spécifiques
- **Distances** : Faisabilité de livraison
- **Quantités** : Estimation de la demande

**Exemple de message client** :
```
"Je recherche environ 2kg de tomates cerises bio, 
de préférence de production locale et sans traitement. 
Budget maximum : 6€/kg"
```

#### 3. Notifier la Disponibilité
Lorsque vous avez un produit correspondant en stock :

1. **Cliquer "Notifier pour [Nom du produit]"**
2. **Confirmer le rayon** de notification
3. **Valider l'envoi** des notifications

#### 4. Suivi des Notifications
- **Compteur affiché** : Nombre d'emails envoyés
- **Pas de spam** : 1 seule notification par client par produit
- **Historique** : Suivi des notifications précédentes

### Exemples d'Utilisation

#### Scénario 1 : Nouveau Stock Reçu
```
Situation : Vous recevez 50kg de tomates cerises bio
Action :
1. Ajouter le produit à votre catalogue
2. Vérifier le dashboard → 8 personnes cherchent "tomates cerises bio"
3. Cliquer "Notifier pour tomates cerises bio"
4. Résultat : 8 emails envoyés automatiquement
```

#### Scénario 2 : Produit Saisonnier
```
Situation : Début de saison des fraises
Action :
1. Consulter dashboard → 15 manifestations pour "fraises"
2. Analyser messages : "fraises de Plougastel", "fraises bio"
3. Adapter votre commande aux préférences
4. Notifier dès réception : 15 clients potentiels alertés
```

#### Scénario 3 : Nouveau Commerce
```
Situation : Vous démarrez votre activité
Action :
1. Consulter dashboard avant de composer votre offre
2. Identifier les produits les plus demandés
3. Prioriser ces produits dans votre catalogue
4. Notifier dès mise en ligne
```

### Optimisation de l'Offre

#### Adaptation du Catalogue
Le dashboard vous aide à :
- **Identifier les manques** : Produits très demandés non disponibles
- **Ajuster les quantités** : Commander selon la demande réelle
- **Découvrir des niches** : Produits spécialisés recherchés

#### Messages Clients comme Source d'Inspiration
Les messages révèlent :
- **Qualités recherchées** : Bio, local, artisanal
- **Quantités typiques** : Portions familiales, professionnelles
- **Budgets** : Positionnement prix
- **Préférences** : Allergies, régimes spéciaux

#### Exemple d'Analyse
```
Produit recherché : "Pain sans gluten"
Messages clients :
- "Pour maladie cœliaque, certification obligatoire"
- "Pain de mie sans gluten pour enfant"  
- "Baguette sans gluten, pas trop sèche"

Actions :
→ Vérifier certifications disponibles
→ Proposer différents formats
→ Mettre en avant la fraîcheur
```

### Gestion des Notifications

#### Bonnes Pratiques
- **Produits en stock réel** : Ne notifiez que si vraiment disponible
- **Description précise** : Nom de produit exact dans votre catalogue
- **Réactivité** : Notifiez rapidement après réapprovisionnement
- **Suivi** : Vérifiez l'impact sur vos ventes

#### Communication avec les Clients
Après notification :
- **Emails automatiques** : Envoyés par la plateforme
- **Informations incluses** : Nom produit, prix, lien direct
- **Contact possible** : Clients peuvent vous contacter via la plateforme

#### Gestion des Ruptures
Si vous n'avez plus de stock après notification :
- **Mettre à jour rapidement** votre catalogue
- **Nouveau stock** : Notifier à nouveau si réapprovisionnement

### Avantages Commerciaux

#### Fidélisation Client
- **Service proactif** : Clients alertés automatiquement
- **Gain de temps** : Plus besoin de chercher, ils sont prévenus
- **Satisfaction** : Réponse directe à leurs besoins

#### Optimisation des Ventes
- **Réduction des invendus** : Production/commande basée sur demande réelle
- **Nouveaux clients** : Manifestations d'intérêt attirent de nouveaux acheteurs
- **Planification** : Anticipation des besoins saisonniers

#### Différenciation Concurrentielle
- **Innovation** : Service unique sur le marché local
- **Réactivité** : Première notification = avantage concurrentiel
- **Relation client** : Meilleure connaissance des besoins

### Interface Mobile et Notifications

#### Accès Mobile
Le dashboard est optimisé pour mobile :
- **Interface responsive** : Utilisation sur smartphone/tablette
- **Notifications push** : Nouvelles manifestations (à venir)
- **Accès rapide** : Notification immédiate depuis le terrain

#### Workflow Mobile
```
Scénario : Au marché de gros
1. Voir nouveau produit intéressant
2. Consulter dashboard mobile
3. Vérifier la demande pour ce produit
4. Décider de l'achat en conséquence
5. Notifier clients une fois en stock
```

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