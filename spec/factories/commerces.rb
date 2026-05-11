FactoryBot.define do
  factory :commerce do
    sequence(:name) { |n| "shop-#{n}-#{SecureRandom.hex(2)}" }
    association :user
    latitude { 48.8566 }
    longitude { 2.3522 }

    trait :with_address do
      adress1 { "1 rue de la Paix, Paris" }
    end
  end
end
