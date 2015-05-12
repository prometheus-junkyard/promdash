FactoryGirl.define do
  factory :server do
    url "http://localhost:31337/"
    sequence :name do |n|
      "New server #{n}"
    end
  end
end
