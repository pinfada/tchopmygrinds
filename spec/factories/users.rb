FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}.#{SecureRandom.hex(2)}@example.test" }
    password { "Password123!" }
    name { "Test User" }
    statut_type { :others }

    trait :buyer do
      statut_type { :others }
      buyer_role { true }
    end

    trait :itinerant do
      statut_type { :itinerant }
      seller_role { true }
    end

    trait :sedentary do
      statut_type { :sedentary }
      seller_role { true }
    end

    trait :admin do
      admin { true }
    end
  end
end
