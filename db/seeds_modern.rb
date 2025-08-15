# Seeds modernes pour TchopMyGrinds - React/Rails API
# Usage: rails runner db/seeds_modern.rb

require 'faker'

puts "🌱 Démarrage du seed moderne pour TchopMyGrinds..."

# Configuration Faker français
Faker::Config.locale = :fr

# Nettoyage des tables (dans l'ordre des dépendances)
puts "🧹 Nettoyage des données existantes..."

Orderdetail.delete_all
Order.delete_all  
Categorization.delete_all
Product.delete_all
Commerce.delete_all
Address.delete_all
User.where.not(email: ['cali77@hotmail.fr', 'dev@tchopmygrinds.com']).delete_all

# Reset sequences
[Orderdetail, Order, Categorization, Product, Commerce, Address].each do |model|
  model.reset_pk_sequence if model.respond_to?(:reset_pk_sequence)
end

# Coordonnées géographiques pour différentes villes françaises
cities_coords = [
  { name: 'Paris', lat: 48.8566, lng: 2.3522, code_postal: '75001' },
  { name: 'Lyon', lat: 45.7640, lng: 4.8357, code_postal: '69001' },
  { name: 'Marseille', lat: 43.2965, lng: 5.3698, code_postal: '13001' },
  { name: 'Toulouse', lat: 43.6047, lng: 1.4442, code_postal: '31000' },
  { name: 'Nice', lat: 43.7102, lng: 7.2620, code_postal: '06000' },
  { name: 'Nantes', lat: 47.2184, lng: -1.5536, code_postal: '44000' },
  { name: 'Angers', lat: 47.4742, lng: -0.5490, code_postal: '49000' },
  { name: 'Bordeaux', lat: 44.8378, lng: -0.5792, code_postal: '33000' }
]

# 1. Création des utilisateurs (marchands)
puts "👥 Création des utilisateurs marchands..."

marchands_itinerants = []
marchands_sedentaires = []
acheteurs = []

# Marchands itinérants (food trucks, marchés)
15.times do
  user = User.create!(
    email: Faker::Internet.unique.email,
    password: 'password123',
    name: Faker::Name.name,
    statut_type: :itinerant,
    seller_role: true,
    buyer_role: false,
    phone: Faker::PhoneNumber.cell_phone
  )
  marchands_itinerants << user
  puts "  ✓ Marchand itinérant: #{user.name}"
end

# Marchands sédentaires (boutiques, restaurants)
25.times do
  user = User.create!(
    email: Faker::Internet.unique.email,
    password: 'password123', 
    name: Faker::Name.name,
    statut_type: :sedentary,
    seller_role: true,
    buyer_role: false,
    phone: Faker::PhoneNumber.cell_phone
  )
  marchands_sedentaires << user
  puts "  ✓ Marchand sédentaire: #{user.name}"
end

# Acheteurs
20.times do
  user = User.create!(
    email: Faker::Internet.unique.email,
    password: 'password123',
    name: Faker::Name.name, 
    statut_type: :others,
    seller_role: false,
    buyer_role: true,
    phone: Faker::PhoneNumber.cell_phone
  )
  acheteurs << user
  puts "  ✓ Acheteur: #{user.name}"
end

# 2. Création des commerces
puts "\n🏪 Création des commerces..."

tous_marchands = marchands_itinerants + marchands_sedentaires
commerces = []

tous_marchands.each do |marchand|
  city = cities_coords.sample
  
  # Variation aléatoire autour des coordonnées de la ville (rayon ~5km)
  lat_variation = (rand - 0.5) * 0.1  # ~5km
  lng_variation = (rand - 0.5) * 0.1
  
  commerce_names = [
    "#{marchand.name.split.first} Market",
    "Chez #{marchand.name.split.first}",
    "Le Petit #{city[:name]}",
    "Bio #{marchand.name.split.first}",
    "Fresh #{city[:name]}",
    "Local Market #{marchand.name.split.first}"
  ]
  
  commerce = Commerce.create!(
    nom: commerce_names.sample,
    adresse1: Faker::Address.street_address,
    adresse2: rand(3) == 0 ? Faker::Address.secondary_address : nil,
    ville: city[:name],
    code_postal: city[:code_postal],
    pays: 'France',
    latitude: city[:lat] + lat_variation,
    longitude: city[:lng] + lng_variation,
    user: marchand
  )
  
  commerces << commerce
  puts "  ✓ Commerce: #{commerce.nom} (#{commerce.ville})"
end

# 3. Création des produits 
puts "\n🥕 Création des produits..."

categories_produits = {
  'Fruits & Légumes' => [
    { nom: 'Pommes Golden', unite: 'kg', prix_min: 2.50, prix_max: 4.00 },
    { nom: 'Bananes', unite: 'kg', prix_min: 1.80, prix_max: 2.50 },
    { nom: 'Tomates', unite: 'kg', prix_min: 3.00, prix_max: 6.00 },
    { nom: 'Carottes', unite: 'kg', prix_min: 1.50, prix_max: 2.80 },
    { nom: 'Courgettes', unite: 'kg', prix_min: 2.00, prix_max: 3.50 },
    { nom: 'Salade verte', unite: 'pièce', prix_min: 1.20, prix_max: 2.00 },
    { nom: 'Oranges', unite: 'kg', prix_min: 2.00, prix_max: 3.50 },
    { nom: 'Pommes de terre', unite: 'kg', prix_min: 1.00, prix_max: 2.50 }
  ],
  'Boulangerie' => [
    { nom: 'Baguette tradition', unite: 'pièce', prix_min: 1.10, prix_max: 1.40 },
    { nom: 'Pain complet', unite: 'pièce', prix_min: 2.50, prix_max: 3.50 },
    { nom: 'Croissant', unite: 'pièce', prix_min: 1.00, prix_max: 1.50 },
    { nom: 'Pain aux raisins', unite: 'pièce', prix_min: 1.20, prix_max: 1.80 }
  ],
  'Fromages' => [
    { nom: 'Camembert', unite: 'pièce', prix_min: 3.50, prix_max: 6.00 },
    { nom: 'Chèvre frais', unite: '250g', prix_min: 4.00, prix_max: 7.00 },
    { nom: 'Roquefort', unite: '200g', prix_min: 8.00, prix_max: 12.00 }
  ],
  'Viandes' => [
    { nom: 'Porc - Côtes', unite: 'kg', prix_min: 8.00, prix_max: 15.00 },
    { nom: 'Bœuf - Steak', unite: 'kg', prix_min: 20.00, prix_max: 35.00 },
    { nom: 'Poulet fermier', unite: 'kg', prix_min: 8.00, prix_max: 14.00 }
  ],
  'Épicerie' => [
    { nom: 'Miel local', unite: 'pot 500g', prix_min: 8.00, prix_max: 15.00 },
    { nom: 'Confiture artisanale', unite: 'pot 250g', prix_min: 4.50, prix_max: 8.00 },
    { nom: 'Huile d\'olive', unite: '500ml', prix_min: 6.00, prix_max: 12.00 }
  ]
}

produits_crees = []

commerces.each do |commerce|
  # Chaque commerce a 5-15 produits de différentes catégories
  nb_produits = rand(5..15)
  
  nb_produits.times do
    categorie = categories_produits.keys.sample
    produit_info = categories_produits[categorie].sample
    
    # Variation de prix selon le type de commerce et la localisation
    prix_base = rand(produit_info[:prix_min]..produit_info[:prix_max])
    # Majoration pour les commerces parisiens
    prix_final = commerce.ville == 'Paris' ? prix_base * 1.15 : prix_base
    
    produit = Product.create!(
      nom: produit_info[:nom],
      quantityperunit: produit_info[:unite],
      unitprice: prix_final.round(2),
      unitsinstock: rand(5..150),
      unitsonorder: rand(0..20),
      description: "#{produit_info[:nom]} de qualité, provenance locale"
    )
    
    # Association commerce-produit via Categorization
    Categorization.create!(
      commerce: commerce,
      product: produit
    )
    
    produits_crees << produit
  end
  
  puts "  ✓ #{commerce.nom}: #{nb_produits} produits ajoutés"
end

# 4. Création des adresses pour les acheteurs
puts "\n🏠 Création des adresses..."

acheteurs.each do |acheteur|
  # 1-3 adresses par acheteur
  nb_adresses = rand(1..3)
  
  nb_adresses.times do |i|
    city = cities_coords.sample
    
    Address.create!(
      user: acheteur,
      adresse1: Faker::Address.street_address,
      adresse2: i == 0 ? nil : Faker::Address.secondary_address,
      ville: city[:name],
      code_postal: city[:code_postal],
      pays: 'France',
      latitude: city[:lat] + (rand - 0.5) * 0.05,
      longitude: city[:lng] + (rand - 0.5) * 0.05,
      nom_adresse: i == 0 ? 'Domicile' : ['Bureau', 'Chez les parents', 'Résidence secondaire'].sample
    )
  end
  
  puts "  ✓ #{acheteur.name}: #{nb_adresses} adresse(s)"
end

# 5. Création de quelques commandes d'exemple
puts "\n📦 Création des commandes d'exemple..."

# Créer 30 commandes avec différents statuts
30.times do
  acheteur = acheteurs.sample
  adresse = acheteur.addresses.sample
  
  next unless adresse # Skip si pas d'adresse
  
  # Commerce dans un rayon raisonnable (même ville de préférence)
  commerce_proche = commerces.select { |c| c.ville == adresse.ville }.sample
  commerce_proche ||= commerces.sample # Fallback
  
  produits_commerce = commerce_proche.products.limit(rand(1..4))
  next if produits_commerce.empty?
  
  order = Order.create!(
    user: acheteur,
    orderdate: rand(30.days).seconds.ago,
    requireddate: rand(2..7).days.from_now,
    status: ['waiting', 'accepted', 'in_progress', 'shipped', 'delivered', 'completed'].sample,
    phone: acheteur.phone || Faker::PhoneNumber.cell_phone,
    adresse_de_livraison: "#{adresse.adresse1}, #{adresse.ville} #{adresse.code_postal}"
  )
  
  # Ajouter les produits à la commande
  produits_commerce.each do |produit|
    quantite = rand(1..5)
    
    Orderdetail.create!(
      order: order,
      product: produit, 
      unitprice: produit.unitprice,
      quantity: quantite,
      discount: 0.0
    )
  end
  
  puts "  ✓ Commande ##{order.id}: #{order.status} (#{produits_commerce.count} produits)"
end

# 6. Statistiques finales
puts "\n📊 SEED TERMINÉ - Statistiques:"
puts "  👥 Utilisateurs: #{User.count}"
puts "    - Marchands itinérants: #{User.where(statut_type: :itinerant).count}"
puts "    - Marchands sédentaires: #{User.where(statut_type: :sedentary).count}" 
puts "    - Acheteurs: #{User.where(statut_type: :others).count}"
puts "  🏪 Commerces: #{Commerce.count}"
puts "  🥕 Produits: #{Product.count}"
puts "  🔗 Associations commerce-produit: #{Categorization.count}"
puts "  🏠 Adresses: #{Address.count}"
puts "  📦 Commandes: #{Order.count}"
puts "  📋 Détails commandes: #{Orderdetail.count}"

puts "\n✅ Données de test créées avec succès pour TchopMyGrinds!"
puts "🔐 Utilisateurs de test disponibles:"
puts "   - Email: dev@tchopmygrinds.com / Mot de passe: devpassword"
puts "   - Email: cali77@hotmail.fr / Mot de passe: password"
puts "\n🌍 Villes avec commerces: #{Commerce.distinct.pluck(:ville).join(', ')}"