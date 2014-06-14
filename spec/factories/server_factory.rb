FactoryGirl.define do
  factory :server do
    name "prometheus"
    url "http://localhost:31337/"
  end
end
