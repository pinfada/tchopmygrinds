puts '🌱 Création des données de test simples...'

# Nettoyer les données
Product.destroy_all
Commerce.destroy_all
User.where.not(admin: true).destroy_all

# Créer un utilisateur test
user = User.create!(
  email: 'test@tchopmygrinds.com',
  password: 'password123',
  name: 'Commerçant Test',
  statut_type: 0,
  phone: '+237690001001'
)

# Créer un commerce
commerce = user.commerces.create!(
  name: 'Test Commerce',
  category: 'Bananes plantain',
  adress1: 'Douala, Cameroun',
  latitude: 4.0511,
  longitude: 9.7679,
  verified: true,
  rating: 4.5,
  rating_count: 25
)

# Créer des produits
products = [
  { name: 'Bananes plantain', price: 2.50, category: 'Bananes plantain', stock: 50 },
  { name: 'Mangues', price: 4.00, category: 'Fruits locaux', stock: 25 },
  { name: 'Tomates', price: 2.80, category: 'Légumes frais', stock: 40 }
]

products.each do |p|
  commerce.products.create!(
    name: p[:name],
    unitprice: p[:price],
    quantityperunit: 'kg',
    category: p[:category],
    description: 'Produit frais de qualité',
    unitsinstock: p[:stock],
    available: true
  )
end

puts "✅ Données créées: #{User.count} users, #{Commerce.count} commerces, #{Product.count} produits"