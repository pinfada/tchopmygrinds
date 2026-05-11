FactoryBot.define do
  factory :rating do
    association :user
    rating { 5 }
    comment { "Great experience" }
    status { :approved }

    trait :for_commerce do
      association :rateable, factory: :commerce
    end

    trait :for_product do
      association :rateable, factory: :product
    end

    trait :pending_moderation do
      status { :pending }
    end
  end
end
