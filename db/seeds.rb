# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
#5.times do
# User.create(
#   name: Faker::Name.name,
#   email: Faker::Internet.email,
#   password: Faker::Internet.password
# )
#end

#User.create(
#  name: 'mitch',
#  email: 'cali77@hotmail.fr',
#  password: 'password'
#)

require 'faker'
require 'open-uri'
require 'nokogiri'

Product.delete_all # suppression de la table produit
Product.reset_pk_sequence # remise de l'id à 1 pour table produit
Categorization.delete_all # suppression de la table produit
Categorization.reset_pk_sequence # remise de l'id à 1 pour table produit

lgrtab = 20
debtab = 0
fintab = 0
url = "https://www.jasonbase.com/things/GKDA.json"
liste = JSON.parse(open(url).read)
fintab = liste.length
debtab = fintab - lgrtab
newliste = liste.slice(debtab, fintab)
commerces = Commerce.all
commerces.each do |commerce|
  sauvproduit = " "
  newliste.each do |x|
    getproduit =  x["produit"]
    getprice = x["Moyen"]
    getunitsonorder = rand(10) + 5
    getquantite = getunitsonorder.to_s + " - " + x["Unitprice"]  
    getunitstock = rand(100) + 10
    next if getproduit == sauvproduit
    sauvproduit = getproduit
    Product.create(name: getproduit, quantityperunit: getquantite, unitprice: getprice, unitsinstock: getunitstock, unitsonorder: getunitsonorder, commerce_id: commerce.id)
  end
  products = Product.all
  products.each do |produit|
    commerce.products << produit
  end
end
