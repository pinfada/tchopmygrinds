# Seeds simplifiés pour les utilisateurs de test E2E
# À exécuter avec: rails runner db/seeds_test_users_simple.rb

puts "🧪 Création des utilisateurs de test E2E..."

begin
  # 1. Utilisateur Admin pour les tests de modération
  admin_user = User.find_or_create_by(email: 'admin@test.com') do |user|
    user.password = 'password123'
    user.password_confirmation = 'password123'
    user.name = 'Admin Test'
    user.statut_type = 'others'
    user.admin = true
  end
  puts "✅ Utilisateur admin: #{admin_user.email}"

  # 2. Utilisateur marchand sédentaire pour les tests de commerce
  merchant_user = User.find_or_create_by(email: 'merchant@test.com') do |user|
    user.password = 'password123'
    user.password_confirmation = 'password123'
    user.name = 'Marchand Test'
    user.statut_type = 'sedentary'
    user.admin = false
  end
  puts "✅ Utilisateur marchand: #{merchant_user.email}"

  # 3. Utilisateur client pour les tests d'achat
  customer_user = User.find_or_create_by(email: 'customer@test.com') do |user|
    user.password = 'password123'
    user.password_confirmation = 'password123'
    user.name = 'Client Test'
    user.statut_type = 'others'
    user.admin = false
  end
  puts "✅ Utilisateur client: #{customer_user.email}"

  # 4. Marchand vérifié avec commerce
  verified_merchant = User.find_or_create_by(email: 'verified_merchant@test.com') do |user|
    user.password = 'password123'
    user.password_confirmation = 'password123'
    user.name = 'Marchand Vérifié'
    user.statut_type = 'sedentary'
    user.admin = false
  end
  puts "✅ Marchand vérifié: #{verified_merchant.email}"

  # 5. Acheteur avec historique
  buyer_user = User.find_or_create_by(email: 'test_buyer@test.com') do |user|
    user.password = 'password123'
    user.password_confirmation = 'password123'
    user.name = 'Acheteur Régulier'
    user.statut_type = 'others'
    user.admin = false
  end
  puts "✅ Acheteur régulier: #{buyer_user.email}"

  # Créer un commerce de test pour le marchand vérifié
  test_commerce = Commerce.find_or_create_by(name: 'Commerce Test E2E') do |commerce|
    commerce.category = 'Alimentaire'
    commerce.details = 'Commerce de test pour les tests automatisés'
    commerce.adress1 = '123 Rue Test, Yaoundé'
    commerce.city = 'Yaoundé'
    commerce.country = 'Cameroun'
    commerce.latitude = 3.848
    commerce.longitude = 11.502
    commerce.user = verified_merchant
    commerce.verified = true
    commerce.phone = '+237123456789'
  end
  puts "✅ Commerce de test: #{test_commerce.name}"

  # Créer des produits de test
  banane_test = Product.find_or_create_by(name: 'Banane Plantain Test', commerce: test_commerce) do |product|
    product.description = 'Bananes plantains fraîches pour les tests E2E'
    product.unitprice = 500.00
    product.category = 'Fruits'
    product.unitsinstock = 50
    product.quantityperunit = '1 kg'
    product.available = true
  end
  puts "✅ Produit: #{banane_test.name}"

  tomate_test = Product.find_or_create_by(name: 'Tomate Test', commerce: test_commerce) do |product|
    product.description = 'Tomates fraîches du marché local'
    product.unitprice = 300.00
    product.category = 'Légumes'
    product.unitsinstock = 30
    product.quantityperunit = '1 kg'
    product.available = true
  end
  puts "✅ Produit: #{tomate_test.name}"

  produit_epuise = Product.find_or_create_by(name: 'Produit Épuisé Test', commerce: test_commerce) do |product|
    product.description = 'Produit en rupture de stock pour tester les manifestations d\'intérêt'
    product.unitprice = 1000.00
    product.category = 'Divers'
    product.unitsinstock = 0
    product.quantityperunit = '1 pièce'
    product.available = false
  end
  puts "✅ Produit: #{produit_epuise.name}"

  # Créer une adresse de test
  test_address = Address.find_or_create_by(user: customer_user, address1: '456 Avenue Test') do |address|
    address.city = 'Yaoundé'
    address.state = 'Centre'
    address.country = 'Cameroun'
    address.latitude = 3.8480
    address.longitude = 11.5021
  end
  puts "✅ Adresse de test créée"

  puts "\n🎉 Utilisateurs et données de test E2E créés avec succès!"
  puts "\nComptes disponibles pour les tests:"
  puts "- Admin: admin@test.com (mot de passe: password123)"
  puts "- Marchand: merchant@test.com (mot de passe: password123)"
  puts "- Client: customer@test.com (mot de passe: password123)"
  puts "- Marchand vérifié: verified_merchant@test.com (mot de passe: password123)"
  puts "- Acheteur: test_buyer@test.com (mot de passe: password123)"
  puts "\n📊 Données créées:"
  puts "- 1 commerce avec #{Product.where(commerce: test_commerce).count} produits"
  puts "- 1 adresse de livraison"

  puts "\n💡 Pour réinitialiser les données de test:"
  puts "   rails runner db/seeds_test_users_simple.rb"

rescue => e
  puts "❌ Erreur lors de la création des données de test: #{e.message}"
  puts "   #{e.backtrace.first}"
end