FactoryBot.define do
  factory :product do
    sequence(:name) { |n| "product-#{n}-#{SecureRandom.hex(2)}" }
    quantityperunit { "1 unit" }
    unitprice { 10.00 }
    unitsinstock { 10 }
    unitsonorder { 0 }
    association :commerce
  end
end
