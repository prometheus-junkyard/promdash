require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

module PrometheusDashboard
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    config.assets.precompile << /\.(?:svg|eot|woff|woff2|ttf)$/
    config.assets.precompile << 'base.js'

    # Required for working dashboard JSON PUTs.
    # See http://stackoverflow.com/a/25428800/915941.
    config.action_dispatch.perform_deep_munge = false

    config.path_prefix = ENV['PROMDASH_PATH_PREFIX'] || '/'
    unless config.path_prefix.start_with?('/')
      config.path_prefix = '/' + config.path_prefix
    end
    unless config.path_prefix.end_with?('/')
      config.path_prefix = config.path_prefix + '/'
    end

    unless config.path_prefix == '/'
      # To prevent a double slash like /prefix//assets we'll cut off the last bit of path_prefix
      config.assets.prefix = config.path_prefix[0..-2] + config.assets.prefix
    end
  end
end
