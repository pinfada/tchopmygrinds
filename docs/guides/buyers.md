# Guide Utilisateur - Acheteurs

## Introduction

TchopMyGrinds vous permet de découvrir et d'acheter des produits locaux dans un rayon de 50km autour de chez vous. Ce guide vous accompagne dans l'utilisation de la plateforme.

## Première Utilisation

### Inscription et Compte

1. **Création de compte** (optionnelle pour navigation)
   ```
   Page d'accueil → S'inscrire
   ```
   - **Email** : Adresse valide pour les confirmations
   - **Mot de passe** : Minimum 6 caractères
   - **Nom** : Nom complet pour les commandes

2. **Type de compte**
   - ✅ **Rôle Acheteur** : Activé par défaut
   - ☐ **Rôle Vendeur** : Si vous souhaitez aussi vendre

3. **Navigation sans compte**
   - Recherche de commerces et produits
   - Visualisation sur carte
   - Inscription requise pour commander

### Autorisation de Géolocalisation

#### Première Visite
```
Le navigateur demande : "Autoriser la géolocalisation ?"
→ Cliquer "Autoriser"
```

**Pourquoi c'est important :**
- Trouve les commerces proches de vous
- Calcule les distances de livraison
- Optimise l'ordre d'affichage des résultats

#### Si Refusée
- Position par défaut : Lyon, France
- Recherche manuelle par ville possible
- Performances réduites

## Recherche de Commerces

### Recherche Géolocalisée

#### Recherche Automatique
1. **Autoriser géolocalisation** si demandé
2. **Rayon de recherche** : 50km par défaut
3. **Affichage sur carte** : Commerces sous forme de marqueurs
4. **Liste détaillée** : Informations et distances

#### Modification du Rayon
```
Interface Carte → Sélecteur Rayon
Options : 5km, 25km, 50km, 100km
```

### Types de Commerces

#### Marqueurs sur la Carte
- 🚚 **Itinérants** : Food trucks, marchés mobiles
- 🏪 **Sédentaires** : Boutiques, restaurants fixes

#### Informations Affichées
- **Nom du commerce**
- **Distance** : Calculée depuis votre position
- **Ville** : Localisation
- **Nombre de produits** : Catalogue disponible

### Recherche Textuelle

```
Barre de recherche → Saisir :
- Nom de commerce : "Épicerie Bio"
- Type de produit : "Tomates"
- Ville : "Lyon"
```

## Navigation sur la Carte

### Interface Carte Interactive

#### Contrôles Disponibles
- **Zoom** : Molette souris ou boutons +/-
- **Navigation** : Glisser-déposer pour se déplacer
- **Centrage** : Bouton 📍 pour revenir à votre position

#### Interaction avec les Marqueurs
1. **Clic sur marqueur** → Popup d'informations
2. **Clic "Voir produits"** → Liste des produits du commerce
3. **Clic commerce dans liste** → Centrage sur la carte

### Recherche par Zone

#### Clic sur la Carte
```
Cliquer n'importe où sur la carte
→ Recherche automatique des commerces autour de ce point
```

**Utilité :**
- Explorer différents quartiers
- Planifier déplacements
- Découvrir nouveaux secteurs

## Découverte des Produits

### Consultation du Catalogue

#### Accès aux Produits
```
Méthodes :
1. Clic marqueur → "Voir produits"
2. Liste commerces → Clic nom commerce
3. Modal détails → Onglet produits
```

#### Informations Produit
- **Nom et description** : Détails du produit
- **Prix unitaire** : En euros
- **Stock disponible** : Quantité restante
- **Commerce vendeur** : Nom et distance

### Recherche de Produits

#### Filtres Disponibles
- **Par commerce** : Produits d'un vendeur spécifique
- **Par distance** : Proximité géographique
- **Par texte** : Nom ou description du produit
- **Disponibilité** : Seulement les produits en stock

#### Comparaison de Prix
- **Même produit** : Plusieurs vendeurs possibles
- **Tri par prix** : Du moins cher au plus cher
- **Tri par distance** : Du plus proche au plus loin

## Système de Panier

### Ajout au Panier

1. **Sélection produit**
   ```
   Liste produits → Clic produit → Modal détails
   ```

2. **Configuration quantité**
   - **Quantité souhaitée** : Sélecteur 1-10
   - **Vérification stock** : Quantité ≤ stock disponible
   - **Calcul sous-total** : Prix × quantité

3. **Ajout confirmation**
   ```
   Bouton "Ajouter au panier"
   → Confirmation visuelle
   → Mise à jour compteur panier
   ```

### Gestion du Panier

#### Consultation du Panier
```
En-tête → Icône panier (avec nombre d'articles)
```

#### Contenu Affiché
- **Liste des produits** : Nom, quantité, prix unitaire
- **Commerce d'origine** : Pour chaque produit
- **Sous-totaux** : Par ligne et total général
- **Actions** : Modifier quantité, supprimer article

#### Modification des Quantités
```
Dans le panier :
- Boutons +/- pour ajuster
- Saisie directe du nombre
- Suppression si quantité = 0
```

### Contraintes du Panier

#### Multi-Commerces
- **Autorisé** : Produits de différents marchands
- **Gestion séparée** : Commandes distinctes par commerce
- **Livraisons** : Potentiellement différentes

#### Stock Dynamique
- **Vérification temps réel** : Stock peut évoluer
- **Rupture pendant navigation** : Alerte utilisateur
- **Réservation temporaire** : Pendant 15 minutes

## Processus de Commande

### Finalisation du Panier

#### Prérequis
- ✅ **Compte utilisateur** : Connexion obligatoire
- ✅ **Adresse de livraison** : Au moins une adresse
- ✅ **Panier non vide** : Minimum 1 produit

#### Étapes de Commande
```
Panier → "Passer commande"
1. Vérification des articles
2. Sélection adresse livraison
3. Confirmation et validation
```

### Gestion des Adresses

#### Première Adresse
```
Profil → Mes Adresses → Nouvelle Adresse
```

**Champs obligatoires :**
- **Rue** : Numéro et nom de rue
- **Ville** : Commune de livraison
- **Code postal** : Pour précision géographique

**Géolocalisation automatique :**
- Coordonnées calculées automatiquement
- Utilisées pour optimiser les livraisons

#### Adresses Multiples
- **Domicile, travail, famille** : Plusieurs options
- **Sélection à la commande** : Choix pour chaque livraison
- **Adresse par défaut** : Pré-sélectionnée

### Validation de Commande

#### Récapitulatif Final
- **Articles commandés** : Quantités et prix
- **Adresse de livraison** : Vérification
- **Total commande** : Montant final
- **Estimation livraison** : Si disponible

#### Confirmation
```
Bouton "Confirmer la commande"
→ Création commande
→ Email de confirmation
→ Statut initial : "En attente"
```

## Suivi des Commandes

### Historique des Commandes

```
Menu utilisateur → Mes Commandes
```

#### Informations Affichées
- **Date de commande** : Horodatage
- **Statut actuel** : Progression
- **Montant total** : Prix final
- **Nombre d'articles** : Quantité totale
- **Commerces concernés** : Vendeurs

### États de Commande

#### 🟡 En Attente (Waiting)
- **Signification** : Commande reçue par le marchand
- **Action client** : Attendre confirmation
- **Durée typique** : Quelques heures
- **Annulation** : Possible

#### 🔵 Acceptée (Accepted)  
- **Signification** : Marchand confirme la commande
- **Action client** : Attendre préparation
- **Notification** : Email de confirmation
- **Annulation** : Selon conditions marchand

#### 🟠 En Préparation (In_Progress)
- **Signification** : Commande en cours de préparation
- **Action client** : Attendre expédition
- **Délai** : Variable selon produits

#### 🚚 Expédiée (Shipped)
- **Signification** : Commande en route
- **Information** : Détails livraison si fournis
- **Suivi** : Numéro de suivi éventuel

#### 📦 Livrée (Delivered)
- **Signification** : Commande reçue
- **Action client** : Confirmer réception si demandé
- **Évaluation** : Possibilité de noter (à venir)

#### ✅ Terminée (Completed)
- **Signification** : Transaction finalisée
- **Historique** : Archivée dans l'historique
- **Réclamation** : Délai limité

#### ❌ Annulée (Cancelled)
- **Signification** : Commande annulée
- **Remboursement** : Selon modalités
- **Raisons** : Affichées si fournies

### Actions sur les Commandes

#### Annulation Client
```
Conditions : Statut "En attente" ou "Acceptée"
Délai : Généralement 30 minutes après confirmation
Action : Bouton "Annuler" dans les détails
```

#### Réclamations
- **Contact direct** : Coordonnées du marchand
- **Support plateforme** : Pour litiges
- **Délai** : 7 jours après livraison

## Fonctionnalités Avancées

### Recherche Avancée

#### Filtres Combinés
```
Interface de recherche :
- Texte libre + rayon géographique
- Type de commerce + produit spécifique
- Prix maximum + stock minimum
```

#### Sauvegarde de Recherches
- **Favoris** : Commerces préférés (à venir)
- **Alertes** : Nouveaux produits/commerces (à venir)

### Navigation Mobile

#### Interface Tactile
- **Gestes** : Pincer pour zoomer, glisser pour naviguer
- **Géolocalisation précise** : GPS du smartphone
- **Mode économie** : Réduction utilisation données

#### Notifications Push
- **Statut commandes** : Mises à jour temps réel
- **Nouveautés** : Nouveaux commerces dans votre zone
- **Promotions** : Offres spéciales (si activées)

## Conseils d'Utilisation

### Optimisation des Recherches

#### Stratégies Efficaces
```
1. Autoriser géolocalisation précise
2. Utiliser mots-clés pertinents
3. Adapter rayon selon besoins
4. Explorer différents quartiers
```

#### Découverte
- **Nouveaux commerces** : Recherche régulière
- **Produits saisonniers** : Vérification périodique
- **Recommandations** : Basées sur localisation

### Gestion des Commandes

#### Planification
- **Délais de livraison** : Vérifier avant commande
- **Disponibilités** : Horaires des marchands
- **Quantités** : Commander selon besoins réels

#### Communication
- **Marchands réactifs** : Privilégier
- **Instructions spéciales** : Via commentaires
- **Coordonnées** : Garder à jour

## Problèmes Courants

### Géolocalisation

#### Problème : Position Incorrecte
```
Solutions :
1. Actualiser la page web
2. Autoriser géolocalisation dans navigateur
3. Vérifier connexion GPS (mobile)
4. Utiliser recherche manuelle par ville
```

#### Problème : Pas de Résultats
```
Causes possibles :
- Rayon trop petit → Augmenter à 50km
- Zone peu desservie → Essayer villes proches  
- Filtres trop restrictifs → Réinitialiser recherche
```

### Commandes

#### Problème : Panier Vide Soudainement
```
Causes :
- Session expirée → Se reconnecter
- Rupture de stock → Vérifier disponibilité
- Problème réseau → Actualiser page
```

#### Problème : Commande Non Confirmée
```
Vérifications :
1. Email de confirmation reçu
2. Statut dans "Mes Commandes"
3. Vérifier dossier spam
4. Contacter marchand si délai dépassé
```

## Support et Aide

### Ressources d'Aide

#### Auto-assistance
- **FAQ** : Questions fréquentes
- **Tutoriels** : Guides pas-à-pas
- **Vidéos** : Démonstrations d'utilisation

#### Contact Support
- **Email** : support@tchopmygrinds.com  
- **Heures** : Lundi-Vendredi 9h-18h
- **Délai réponse** : 24-48h ouvrées

### Signalement de Problèmes

#### Types de Signalements
- **Informations erronées** : Commerce/produit
- **Problème technique** : Bugs interface
- **Litiges marchands** : Qualité/livraison

```
Procédure :
1. Documenter le problème (captures d'écran)
2. Noter les détails (heure, actions effectuées)
3. Contacter support avec éléments
```

TchopMyGrinds facilite la découverte et l'achat de produits locaux tout en soutenant l'économie de proximité.