require 'slug_maker'

FactoryGirl.define do
  factory :dashboard do
    sequence :name do |n|
      "New dashboard #{n}"
    end

    sequence :slug do |n|
      SlugMaker.slug(name)
    end

    dashboard_json File.read('./spec/support/sample_json/1_expression_dashboard_json')
  end
end
