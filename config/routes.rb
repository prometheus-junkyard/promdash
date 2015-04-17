PrometheusDashboard::Application.routes.draw do

  if Rails.configuration.path_prefix != '/'
    get '/', to: redirect(Rails.configuration.path_prefix)
  end

  scope Rails.configuration.path_prefix do

    mount JasmineRails::Engine => '/specs' if defined?(JasmineRails)

    if Rails.env.test?
      require_relative '../spec/support/fauxmetheus/fauxmetheus'
      get '/api/:path' => FauxMetheus
    end

    resources :dashboards, except: :index
    resources :servers
    resources :directories

    get '/annotations', to: 'dashboards#annotations'
    get '/dashboards/:id/clone', to: 'dashboards#clone', as: :clone_dashboard
    get '/dashboards/:id/widgets', to: 'dashboards#widgets'
    get '/w/:slug/:profile', to: 'single_widget#show'
    get '/w/:slug', to: 'single_widget#show', as: 'single_widget'
    post '/w', to: 'single_widget#create'
    get '/permalink/:id', to: 'dashboards#show'
    post '/permalink', to: 'dashboards#permalink'
    get '/embed/:slug/:profile', to: 'embed#show'
    get '/embed/:slug', to: 'embed#show'
    get '/:slug/:profile', to: 'dashboards#show'
    get '/:slug', to: 'dashboards#show', as: 'dashboard_slug'
    match '/:slug/:profile', to: 'dashboards#update', via: [:put, :patch]
    match '/:slug', to: 'dashboards#update', as: 'dashboard_slug_put', via: [:put, :patch]
    get '/_entypo/charmap', to: 'entypo/charmap#index'
    root 'directories#index'

  end
end
