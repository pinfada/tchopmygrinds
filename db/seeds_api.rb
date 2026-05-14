# Seeds pour l'API React - Données de test
puts "🌱 Création des données de test pour l'API..."

# Nettoyer les données existantes en mode développement
if Rails.env.development?
  puts "🗑️  Nettoyage des données existantes..."
  Order.destroy_all
  Product.destroy_all
  Commerce.destroy_all
  User.where.not(admin: true).destroy_all
end

# Créer des utilisateurs de test
puts "👤 Création des utilisateurs..."

# Admin (si n'existe pas)
admin = User.find_or_create_by(email: 'admin@tchopmygrinds.com') do |u|
  u.password = 'password123'
  u.name = 'Admin TchopMyGrinds'
  u.admin = true
  u.statut_type = 2 # others
  u.phone = '+237600000000'
end

# Commerçants itinérants
merchants_itinerant = [
  {
    email: 'marie.plantain@test.com',
    name: 'Marie Plantain',
    phone: '+237690001001',
    commerce: {
      name: 'Marie Bananes Bio',
      category: 'Bananes plantain',
      address: 'Marché Central, Douala',
      latitude: 4.0511,
      longitude: 9.7679,
      verified: true,
      rating: 4.7,
      phone: '+237 690 00 10 01',
      opening_hours: 'Lun-Sam 7h-18h, Dim 7h-12h',
      details: 'Spécialiste des bananes plantain bio du Cameroun, livrées du producteur au panier. Variétés mûres, vertes et douces selon arrivage.',
      image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=60'
    }
  },
  {
    email: 'paul.fruits@test.com',
    name: 'Paul Fruiter',
    phone: '+237690001002',
    commerce: {
      name: 'Fruits Paul Cameroun',
      category: 'Fruits locaux',
      address: 'Marché Mokolo, Yaoundé',
      latitude: 3.8480,
      longitude: 11.5021,
      verified: true,
      rating: 4.5,
      phone: '+237 690 00 10 02',
      opening_hours: 'Lun-Sam 8h-19h, Dim fermé',
      details: 'Vendeur de fruits tropicaux frais à Yaoundé : mangues Kent, papayes, ananas Victoria et bien plus.',
      image_url: 'https://images.unsplash.com/photo-1605478577873-bd4c7c19064c?w=800&q=60'
    }
  }
]

# Commerçants sédentaires
merchants_sedentary = [
  {
    email: 'grace.epicerie@test.com',
    name: 'Grace Épicerie',
    phone: '+237690002001',
    commerce: {
      name: 'Épicerie Grace & Fils',
      category: 'Alimentation générale',
      address: 'Avenue Charles de Gaulle, Douala',
      latitude: 4.0435,
      longitude: 9.7830,
      verified: true,
      rating: 4.8,
      website: 'https://graceetfils.cm',
      phone: '+237 690 00 20 01',
      opening_hours: 'Lun-Ven 8h-20h, Sam 9h-18h, Dim fermé',
      details: 'Épicerie de quartier depuis 2010. Produits du terroir camerounais, riz parfumé, huile de palme, épices et produits importés.',
      image_url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=60'
    }
  },
  {
    email: 'martin.legumes@test.com',
    name: 'Martin Légumes',
    phone: '+237690002002',
    commerce: {
      name: 'Légumes Frais Martin',
      category: 'Légumes frais',
      address: 'Quartier Essos, Yaoundé',
      latitude: 3.8667,
      longitude: 11.5167,
      verified: false,
      rating: 4.2,
      phone: '+237 690 00 20 02',
      opening_hours: 'Tous les jours 7h30-19h',
      details: 'Légumes frais du jardin maraîcher familial, récoltés chaque matin. Tomates, oignons, piments et plus encore.',
      image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=60'
    }
  }
]

# Clients
customers = [
  {
    email: 'client1@test.com',
    name: 'Jean Acheteur',
    phone: '+237690003001'
  },
  {
    email: 'client2@test.com', 
    name: 'Sylvie Cliente',
    phone: '+237690003002'
  }
]

# Créer les commerçants itinérants
merchants_itinerant.each do |merchant_data|
  user = User.create!(
    email: merchant_data[:email],
    password: 'password123',
    name: merchant_data[:name],
    phone: merchant_data[:phone],
    statut_type: 0, # itinerant
    seller_role: true
  )
  
  commerce = user.commerces.create!(
    name: merchant_data[:commerce][:name],
    category: merchant_data[:commerce][:category],
    adress1: merchant_data[:commerce][:address],
    latitude: merchant_data[:commerce][:latitude],
    longitude: merchant_data[:commerce][:longitude],
    verified: merchant_data[:commerce][:verified],
    rating: merchant_data[:commerce][:rating],
    rating_count: rand(10..50),
    phone: merchant_data[:commerce][:phone],
    opening_hours: merchant_data[:commerce][:opening_hours],
    details: merchant_data[:commerce][:details],
    image_url: merchant_data[:commerce][:image_url]
  )

  puts "✅ Créé commerçant itinérant: #{user.name} - #{commerce.name}"
end

# Créer les commerçants sédentaires
merchants_sedentary.each do |merchant_data|
  user = User.create!(
    email: merchant_data[:email],
    password: 'password123', 
    name: merchant_data[:name],
    phone: merchant_data[:phone],
    statut_type: 1, # sedentary
    seller_role: true
  )
  
  commerce = user.commerces.create!(
    name: merchant_data[:commerce][:name],
    category: merchant_data[:commerce][:category],
    adress1: merchant_data[:commerce][:address],
    latitude: merchant_data[:commerce][:latitude],
    longitude: merchant_data[:commerce][:longitude],
    verified: merchant_data[:commerce][:verified],
    rating: merchant_data[:commerce][:rating],
    rating_count: rand(15..60),
    website: merchant_data[:commerce][:website],
    phone: merchant_data[:commerce][:phone],
    opening_hours: merchant_data[:commerce][:opening_hours],
    details: merchant_data[:commerce][:details],
    image_url: merchant_data[:commerce][:image_url]
  )

  puts "✅ Créé commerçant sédentaire: #{user.name} - #{commerce.name}"
end

# Créer les clients
customers.each do |customer_data|
  user = User.create!(
    email: customer_data[:email],
    password: 'password123',
    name: customer_data[:name], 
    phone: customer_data[:phone],
    statut_type: 2, # others
    buyer_role: true
  )
  
  puts "✅ Créé client: #{user.name}"
end

# Créer des produits pour chaque commerce
puts "🛍️  Création des produits..."

Commerce.find_each do |commerce|
  case commerce.category
  when 'Bananes plantain'
    products = [
      { name: 'Bananes plantain mûres', price: 2.50, unit: 'kg', category: 'Bananes plantain', stock: 50 },
      { name: 'Bananes plantain vertes', price: 2.00, unit: 'kg', category: 'Bananes plantain', stock: 30 },
      { name: 'Bananes douce', price: 3.00, unit: 'régime', category: 'Bananes plantain', stock: 20 }
    ]
  when 'Fruits locaux'
    products = [
      { name: 'Mangues Kent', price: 4.00, unit: 'kg', category: 'Fruits locaux', stock: 25 },
      { name: 'Papayes', price: 3.50, unit: 'pièce', category: 'Fruits locaux', stock: 15 },
      { name: 'Ananas Victoria', price: 5.00, unit: 'pièce', category: 'Fruits locaux', stock: 10 }
    ]
  when 'Légumes frais'
    products = [
      { name: 'Tomates fraîches', price: 2.80, unit: 'kg', category: 'Légumes frais', stock: 40 },
      { name: 'Oignons rouges', price: 2.20, unit: 'kg', category: 'Légumes frais', stock: 35 },
      { name: 'Piments forts', price: 8.00, unit: 'kg', category: 'Légumes frais', stock: 12 }
    ]
  when 'Alimentation générale'
    products = [
      { name: 'Riz parfumé 5kg', price: 12.00, unit: 'sac', category: 'Céréales', stock: 25 },
      { name: 'Huile de palme', price: 6.50, unit: 'litre', category: 'Épicerie fine', stock: 18 },
      { name: 'Farine de maïs', price: 4.50, unit: 'kg', category: 'Céréales', stock: 30 }
    ]
  else
    products = [
      { name: 'Produit local', price: 3.00, unit: 'kg', category: 'Divers', stock: 20 }
    ]
  end
  
  products.each do |product_data|
    product = commerce.products.create!(
      name: product_data[:name],
      unitprice: product_data[:price],
      quantityperunit: product_data[:unit],
      category: product_data[:category],
      description: "#{product_data[:name]} de qualité supérieure du Cameroun",
      unitsinstock: product_data[:stock],
      available: true
    )
    
    puts "  ✅ Produit: #{product.name} - #{product.unitprice}€/#{product.quantityperunit}"
  end
end

# Créer quelques commandes de test
puts "📦 Création des commandes de test..."

clients = User.where(statut_type: 2, buyer_role: true).limit(2)
clients.each do |client|
  products = Product.limit(3)
  
  order = client.orders.create!(
    status: 'Waiting',
    delivery_address: 'Quartier Bonanjo, Douala',
    phone: client.phone,
    notes: 'Livraison rapide svp'
  )
  
  total = 0
  products.each do |product|
    quantity = rand(1..3)
    detail = order.orderdetails.create!(
      product: product,
      quantity: quantity,
      unitprice: product.unitprice
    )
    total += detail.quantity * detail.unitprice
  end
  
  order.update!(total_amount: total)
  puts "  ✅ Commande: #{order.id} - #{total}€"
end

puts "🎉 Données de test créées avec succès!"
puts ""
puts "📊 Résumé:"
puts "- Utilisateurs: #{User.count}"
puts "- Commerces: #{Commerce.count}" 
puts "- Produits: #{Product.count}"
puts "- Commandes: #{Order.count}"
puts ""
puts "🔑 Comptes de test:"
puts "- Admin: admin@tchopmygrinds.com / password123"
puts "- Commerçant: marie.plantain@test.com / password123"
puts "- Client: client1@test.com / password123"