# Seeds spécifiques pour les utilisateurs de test E2E
# À exécuter avec: rails runner db/seeds_test_users.rb

puts "🧪 Création des utilisateurs de test E2E..."

# Supprimer les utilisateurs de test existants pour éviter les doublons
test_emails = [
  'admin@test.com',
  'merchant@test.com', 
  'customer@test.com',
  'verified_merchant@test.com',
  'test_buyer@test.com'
]

# Supprimer seulement s'ils existent pour éviter les conflits de contraintes
test_emails.each do |email|
  user = User.find_by(email: email)
  user&.destroy
end
puts "🗑️  Utilisateurs de test existants supprimés"

# 1. Utilisateur Admin pour les tests de modération
admin_user = User.create!(
  email: 'admin@test.com',
  password: 'password123',
  password_confirmation: 'password123',
  name: 'Admin Test',
  statut_type: 'others',
  admin: true
)
puts "✅ Utilisateur admin créé: #{admin_user.email}"

# 2. Utilisateur marchand sédentaire pour les tests de commerce
merchant_user = User.create!(
  email: 'merchant@test.com',
  password: 'password123',
  password_confirmation: 'password123',
  name: 'Marchand Test',
  statut_type: 'sedentary',
  admin: false
)
puts "✅ Utilisateur marchand créé: #{merchant_user.email}"

# 3. Utilisateur client pour les tests d'achat
customer_user = User.create!(
  email: 'customer@test.com',
  password: 'password123',
  password_confirmation: 'password123',
  name: 'Client Test',
  statut_type: 'others',
  admin: false
)
puts "✅ Utilisateur client créé: #{customer_user.email}"

# 4. Marchand vérifié avec commerce
verified_merchant = User.create!(
  email: 'verified_merchant@test.com',
  password: 'password123',
  password_confirmation: 'password123',
  name: 'Marchand Vérifié',
  statut_type: 'sedentary',
  admin: false
)
puts "✅ Marchand vérifié créé: #{verified_merchant.email}"

# 5. Acheteur avec historique
buyer_user = User.create!(
  email: 'test_buyer@test.com',
  password: 'password123',
  password_confirmation: 'password123',
  name: 'Acheteur Régulier',
  statut_type: 'others',
  admin: false
)
puts "✅ Acheteur régulier créé: #{buyer_user.email}"

# Créer un commerce de test pour le marchand vérifié
test_commerce = Commerce.create!(
  name: 'Commerce Test E2E',
  category: 'Alimentaire',
  details: 'Commerce de test pour les tests automatisés',
  adress1: '123 Rue Test, Yaoundé',
  city: 'Yaoundé',
  country: 'Cameroun',
  latitude: 3.848,
  longitude: 11.502,
  user: verified_merchant,
  verified: true,
  phone: '+237123456789'
)
puts "✅ Commerce de test créé: #{test_commerce.name}"

# Créer des produits de test
test_products = [
  {
    name: 'Banane Plantain Test',
    description: 'Bananes plantains fraîches pour les tests E2E',
    unitprice: 500.00,
    category: 'Fruits',
    unitsinstock: 50,
    quantityperunit: '1 kg',
    available: true
  },
  {
    name: 'Tomate Test',
    description: 'Tomates fraîches du marché local',
    unitprice: 300.00,
    category: 'Légumes', 
    unitsinstock: 30,
    quantityperunit: '1 kg',
    available: true
  },
  {
    name: 'Produit Épuisé Test',
    description: 'Produit en rupture de stock pour tester les manifestations d\'intérêt',
    unitprice: 1000.00,
    category: 'Divers',
    unitsinstock: 0,
    quantityperunit: '1 pièce',
    available: false
  }
]

test_products.each do |product_data|
  product = Product.create!(
    product_data.merge(
      commerce: test_commerce
    )
  )
  puts "✅ Produit créé: #{product.name} (Stock: #{product.unitsinstock})"
end

# Créer des adresses de test
test_address = Address.create!(
  user: customer_user,
  address1: '456 Avenue Test',
  city: 'Yaoundé',
  state: 'Centre',
  country: 'Cameroun',
  latitude: 3.8480,
  longitude: 11.5021
)
puts "✅ Adresse de test créée pour le client"

# Créer quelques évaluations de test (en statut pending pour tester la modération)
if defined?(Rating)
  test_ratings = [
    {
      user: customer_user,
      rateable: test_commerce,
      rating: 5,
      comment: 'Excellent commerce, très bon service!',
      status: 'pending'
    },
    {
      user: buyer_user,
      rateable: Product.first,
      rating: 4,
      comment: 'Produits de bonne qualité, livraison rapide.',
      status: 'pending'
    },
    {
      user: customer_user,
      rateable: Product.second,
      rating: 3,
      comment: 'Correct mais peut mieux faire.',
      status: 'approved'
    }
  ]

  test_ratings.each do |rating_data|
    rating = Rating.create!(rating_data)
    puts "✅ Évaluation créée: #{rating.rating}⭐ pour #{rating.rateable.class.name}"
  end
end

# Créer un ordre de test pour tester l'historique
test_order = Order.create!(
  user: customer_user,
  status: 'Delivered',
  order_date: 1.week.ago,
  total_amount: 800
)

# Ajouter des détails à la commande
product1 = Product.first
product2 = Product.second

if defined?(Orderdetail)
  Orderdetail.create!(
    order: test_order,
    product: product1,
    quantity: 1,
    unit_price: product1.unitprice
  )

  Orderdetail.create!(
    order: test_order,
    product: product2,
    quantity: 1,
    unit_price: product2.unitprice
  )
  puts "✅ Commande de test créée avec détails"
end

puts "\n🎉 Utilisateurs et données de test E2E créés avec succès!"
puts "\nComptes disponibles pour les tests:"
puts "- Admin: admin@test.com (mot de passe: password123)"
puts "- Marchand: merchant@test.com (mot de passe: password123)"
puts "- Client: customer@test.com (mot de passe: password123)"
puts "- Marchand vérifié: verified_merchant@test.com (mot de passe: password123)"
puts "- Acheteur: test_buyer@test.com (mot de passe: password123)"
puts "\n📊 Données créées:"
puts "- 1 commerce avec #{Product.count} produits"
puts "- #{test_ratings.length} évaluations de test" if defined?(Rating)
puts "- 1 commande avec historique"
puts "- 1 adresse de livraison"

puts "\n💡 Pour réinitialiser les données de test:"
puts "   rails runner db/seeds_test_users.rb"