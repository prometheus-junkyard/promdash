require 'slug_maker'

FactoryGirl.define do
  factory :dashboard do
    sequence :name do |n|
      "New dashboard #{n}"
    end

    sequence :slug do |n|
      SlugMaker.slug(name)
    end

    trait :permalink do
      permalink true
      sequence :name do |n|
        "Permalink dashboard #{n}"
      end
    end

    dashboard_json File.read('./spec/support/sample_json/1_expression_dashboard_json')

    trait :two_expressions do
      dashboard_json File.read('./spec/support/sample_json/2_expression_dashboard_json')
    end

    trait :pie_chart do
      dashboard_json File.read('./spec/support/sample_json/pie_chart_dashboard_json')
    end

    trait :gauge_chart do
      dashboard_json File.read('./spec/support/sample_json/gauge_chart_dashboard_json')
    end
  end
end
