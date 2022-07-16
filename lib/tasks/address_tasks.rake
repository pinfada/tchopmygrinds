namespace :address_tasks do
  desc "Erase and fill database"
    task :populate => :environment do 
    require 'faker'

    Rake::Task['db:reset'].invoke

    # Create 10 posts
    10.times do
      Commerce.create do |c|
        c.name = Faker::Name.unique.name # all options available below
        c.adress1 = Faker::Address.street_address
        c.adress2 = Faker::Address.secondary_address
        c.details = Faker::Lorem.sentence(3, false, 4)
        c.postal  = Faker::Address.zip_code
        c.country = Faker::Address.country
        c.lat     = Faker::Address.latitude
        c.lon     = Faker::Address.longitude
      end
    end
  end
end