source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.1.7'

gem 'mysql2'
gem 'pg'
gem 'activerecord-postgresql-adapter'

gem 'active_model_serializers'

group :production do
  gem 'thin'
end

group :development do
  # Use sqlite3 as the database for Active Record
  gem 'sqlite3'
end

group :test, :development do
  gem 'factory_girl_rails'
  gem 'sinatra'
  gem 'pry'
  gem 'jasmine-rails'
  gem 'rspec-rails', "~> 3.0.0.beta2"
  gem 'selenium-webdriver'
  gem 'database_cleaner'
  gem 'launchy'
  gem 'capybara', "~> 2.3.0"
  gem 'rake' # for .travis.yml
end

# Use SCSS for stylesheets
gem 'sass-rails', '~> 4.0.4'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# See https://github.com/sstephenson/execjs#readme for more supported runtimes
gem 'therubyracer', platforms: :ruby

# Use jquery as the JavaScript library
gem 'jquery-rails'

# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
# gem 'turbolinks'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 1.2'

group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'sdoc', require: false
end

# Use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# Use unicorn as the app server
# gem 'unicorn'

# Use Capistrano for deployment
# gem 'capistrano', group: :development

# Use debugger
# gem 'debugger', group: [:development, :test]

#gem 'bootstrap-sass', github: 'thomas-mcdonald/bootstrap-sass', branch: 'master'
gem 'entypo-rails'

gem 'json-schema'
