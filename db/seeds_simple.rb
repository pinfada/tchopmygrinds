# Seeds simple pour tester l'API rapidement
puts "🌱 Creating simple test data..."

# Créer quelques utilisateurs de test
user1 = User.find_or_create_by(email: 'marchand1@test.com') do |u|
  u.password = 'password123'
  u.name = 'Marchand Test 1'
  u.statut_type = :sedentary
  u.seller_role = true
end

user2 = User.find_or_create_by(email: 'marchand2@test.com') do |u|
  u.password = 'password123'
  u.name = 'Marchand Test 2'
  u.statut_type = :itinerant
  u.seller_role = true
end

# Créer quelques commerces de test avec les bons noms de champs
commerce1 = Commerce.find_or_create_by(name: 'commerce test angers') do |c|
  c.adress1 = '2 Rue de la République, Angers'
  c.city = 'Angers'
  c.latitude = 47.4742699
  c.longitude = -0.5490779
  c.user = user1
  c.details = 'Commerce de test à Angers'
  c.category = 'Alimentation générale'
  c.phone = '02 41 00 00 00'
  c.verified = true
  c.rating = 4.2
end

commerce2 = Commerce.find_or_create_by(name: 'marché itinérant paris') do |c|
  c.adress1 = 'Place des Vosges, Paris'
  c.city = 'Paris' 
  c.latitude = 48.8566
  c.longitude = 2.3522
  c.user = user2
  c.details = 'Marché itinérant sur Paris'
  c.category = 'Fruits et légumes'
  c.phone = '01 42 00 00 00'
  c.verified = false
  c.rating = 3.8
end

# Créer quelques produits
product1 = Product.find_or_create_by(name: 'bananes plantain') do |p|
  p.quantityperunit = '1 kg'
  p.unitprice = 3.50
  p.unitsinstock = 50
  p.description = 'Bananes plantain fraîches'
end

product2 = Product.find_or_create_by(name: 'tomates cerises') do |p|
  p.quantityperunit = '500g'
  p.unitprice = 4.20
  p.unitsinstock = 25
  p.description = 'Tomates cerises bio'
end

# Associer produits aux commerces via Categorization
Categorization.find_or_create_by(commerce: commerce1, product: product1)
Categorization.find_or_create_by(commerce: commerce1, product: product2)
Categorization.find_or_create_by(commerce: commerce2, product: product1)

puts "✅ Created:"
puts "  Users: #{User.count}"
puts "  Commerces: #{Commerce.count}"
puts "  Products: #{Product.count}"
puts "  Categorizations: #{Categorization.count}"
puts "\n🔍 Test coordinates:"
puts "  Angers: 47.4742699, -0.5490779"
puts "  Paris: 48.8566, 2.3522"