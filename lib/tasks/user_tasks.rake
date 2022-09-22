require 'faker'

namespace :user_tasks do
  desc "Ajout nouveaux utilisateurs"
  task :populate => :environment do
    Rake::Task['db:reset'].invoke
    #Orderdetail.delete_all
    #Orderdetail.reset_pk_sequence
    #Product.delete_all # suppression de la table produit
    #Product.reset_pk_sequence # remise de l'id à 1 pour table produit
    #Categorization.delete_all # suppression de la table produit
    #Categorization.reset_pk_sequence # remise de l'id à 1 pour table produit
    #Order.delete_all
    #Order.reset_pk_sequence
    #Commerce.delete_all
    #Commerce.reset_pk_sequence
    #Address.delete_all
    #Address.reset_pk_sequence
    #User.delete_all # suppression de la table user
    #User.reset_pk_sequence # remise de l'id à 1 pour table user
    #User.create!(:nom => "Utilisateur exemple",
    #             :email => "example@railstutorial.org",
    #             :password => "foobar",
    #             :password_confirmation => "foobar")
    # creation client
    3.times do |n|
      nom  = Faker::Name.name
      email = "buyer-#{n+1}@tchopit.com"
      password  = "motdepasse"
      User.create!(:name => nom,
                   :email => email,
                   :password => password,
                   :password_confirmation => password,
                   :statut_type => 2,
                   :buyer_role => true,
                   :seller_role => false)
    end
  end
end