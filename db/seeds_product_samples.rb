# Fichier de données de test pour les fonctionnalités de recherche de produits
# Exécuter avec: rails runner db/seeds_product_samples.rb

puts "🌱 Création de données de test pour TchopMyGrinds..."

# Créer des utilisateurs de test si ils n'existent pas
def create_test_user(email, name, seller: false, buyer: true, statut_type: 'others')
  user = User.find_or_create_by(email: email) do |u|
    u.name = name
    u.password = 'password123'
    u.password_confirmation = 'password123'
    u.seller_role = seller
    u.buyer_role = buyer
    u.statut_type = statut_type
  end
  puts "👤 Utilisateur créé: #{user.name} (#{user.email})"
  user
end

# Créer des commerces de test
def create_test_commerce(user, nom, ville, latitude, longitude)
  commerce = user.commerces.find_or_create_by(nom: nom) do |c|
    c.ville = ville
    c.latitude = latitude
    c.longitude = longitude
    c.adresse = "#{nom}, #{ville}"
    c.description = "Commerce de test pour #{nom}"
  end
  puts "🏪 Commerce créé: #{commerce.nom} à #{commerce.ville}"
  commerce
end

# Créer des produits et les associer aux commerces
def create_test_product(nom, prix, stock, description = nil)
  product = Product.find_or_create_by(nom: nom) do |p|
    p.unitprice = prix
    p.unitsinstock = stock
    p.unitsonorder = 0
    p.description = description || "#{nom} de qualité"
  end
  puts "🥑 Produit créé: #{product.nom} - #{product.unitprice}€"
  product
end

begin
  # 1. Créer des marchands de test
  marchand_lyon = create_test_user(
    'marchand.lyon@test.com', 
    'Épicerie Bio Lyon',
    seller: true,
    statut_type: 'sedentary'
  )

  marchand_mobile = create_test_user(
    'foodtruck@test.com',
    'Food Truck Tropical',
    seller: true,
    statut_type: 'itinerant'
  )

  marchand_paris = create_test_user(
    'fruits.paris@test.com',
    'Fruits Exotiques Paris',
    seller: true,
    statut_type: 'sedentary'
  )

  # 2. Créer un acheteur de test
  acheteur = create_test_user(
    'client@test.com',
    'Jean Client',
    buyer: true
  )

  # 3. Créer des commerces géolocalisés
  # Lyon et environs
  commerce_lyon = create_test_commerce(
    marchand_lyon, 
    'Épicerie Bio du Rhône', 
    'Lyon', 
    45.7640, 
    4.8357
  )

  commerce_villeurbanne = create_test_commerce(
    marchand_lyon,
    'Bio Market Villeurbanne',
    'Villeurbanne',
    45.7772,
    4.8632
  )

  # Food truck mobile (position variable)
  commerce_mobile = create_test_commerce(
    marchand_mobile,
    'Truck des Tropiques',
    'Lyon',
    45.7578,
    4.8320
  )

  # Paris (plus loin)
  commerce_paris = create_test_commerce(
    marchand_paris,
    'Marché Exotique Belleville',
    'Paris',
    48.8566,
    2.3522
  )

  # 4. Créer des produits test avec focus sur la banane plantain
  banane_plantain_1 = create_test_product(
    'Banane plantain',
    2.50,
    50,
    'Bananes plantains mûres, parfaites pour la cuisson. Origine Afrique de l\'Ouest.'
  )

  banane_plantain_2 = create_test_product(
    'Banane plantain verte',
    2.20,
    30,
    'Bananes plantains vertes, idéales pour les plats salés et les frites de plantain.'
  )

  banane_plantain_3 = create_test_product(
    'Banane plantain bio',
    3.00,
    25,
    'Bananes plantains biologiques, cultivées sans pesticides.'
  )

  # Autres produits tropicaux/africains
  igname = create_test_product(
    'Igname',
    4.50,
    20,
    'Igname fraîche, tubercule traditionnel africain.'
  )

  manioc = create_test_product(
    'Manioc',
    3.80,
    15,
    'Manioc frais, racine nutritive et polyvalente.'
  )

  mangue = create_test_product(
    'Mangue',
    1.80,
    40,
    'Mangues juteuses et sucrées, fruit tropical par excellence.'
  )

  ananas = create_test_product(
    'Ananas',
    3.50,
    12,
    'Ananas frais et parfumé, fruit exotique délicieux.'
  )

  avocat = create_test_product(
    'Avocat',
    1.50,
    35,
    'Avocats mûrs à point, parfaits pour les salades.'
  )

  # 5. Associer les produits aux commerces (via Categorization)
  puts "\n🔗 Association des produits aux commerces..."

  # Commerce Lyon - gamme complète
  [banane_plantain_1, banane_plantain_2, igname, manioc, mangue, avocat].each do |product|
    Categorization.find_or_create_by(commerce: commerce_lyon, product: product)
  end

  # Commerce Villeurbanne - spécialisé bio
  [banane_plantain_3, banane_plantain_1, mangue, avocat].each do |product|
    Categorization.find_or_create_by(commerce: commerce_villeurbanne, product: product)
  end

  # Food truck mobile - sélection de fruits
  [banane_plantain_1, mangue, ananas, avocat].each do |product|
    Categorization.find_or_create_by(commerce: commerce_mobile, product: product)
  end

  # Commerce Paris - gamme exotique
  [banane_plantain_2, banane_plantain_3, ananas, mangue].each do |product|
    Categorization.find_or_create_by(commerce: commerce_paris, product: product)
  end

  # 6. Créer une adresse pour l'acheteur test
  acheteur.addresses.find_or_create_by(
    street: '10 Place Bellecour',
    city: 'Lyon',
    postal_code: '69002',
    country: 'France'
  ) do |address|
    # Coordonnées de Place Bellecour, Lyon
    address.latitude = 45.7578
    address.longitude = 4.8320
  end

  puts "\n✅ Données de test créées avec succès !"
  puts "\n📊 Résumé:"
  puts "   - #{User.count} utilisateurs"
  puts "   - #{Commerce.count} commerces"
  puts "   - #{Product.count} produits"
  puts "   - #{Categorization.count} associations produit-commerce"
  puts "   - #{Address.count} adresses"

  puts "\n🔍 Pour tester la recherche de banane plantain:"
  puts "   1. Allez sur l'application (http://localhost:3000)"
  puts "   2. Autorisez la géolocalisation ou utilisez une position à Lyon"
  puts "   3. Tapez 'banane plantain' dans la barre de recherche"
  puts "   4. Vous devriez voir #{Product.where('nom LIKE ?', '%banane plantain%').count} résultats"

  puts "\n👤 Comptes de test:"
  puts "   - Acheteur: client@test.com / password123"
  puts "   - Marchand Lyon: marchand.lyon@test.com / password123"
  puts "   - Food Truck: foodtruck@test.com / password123"

rescue => e
  puts "❌ Erreur lors de la création des données de test: #{e.message}"
  puts e.backtrace[0..5].join("\n")
end