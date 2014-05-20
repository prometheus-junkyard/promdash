FactoryGirl.define do
  factory :directory do
    sequence :name do |n|
      "New directory #{n}"
    end
  end
end
