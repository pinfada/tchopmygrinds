FactoryBot.define do
  factory :order do
    association :user
    status { :Waiting } # NOTE: enum uses CamelCase keys, see Order#enum

    trait :delivered do
      status { :Delivered }
    end

    trait :cancelled do
      status { :Cancelled }
    end

    trait :completed do
      status { :Completed }
    end
  end

  factory :orderdetail do
    association :order
    association :product
    quantity { 1 }
    unitprice { 10.00 }
    discount { 0 }
  end
end
