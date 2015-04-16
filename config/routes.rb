PrometheusDashboard::Application.routes.draw do
  mount JasmineRails::Engine => '/specs' if defined?(JasmineRails)

  if Rails.env.test?
    require_relative '../spec/support/fauxmetheus/fauxmetheus'
    get '/api/:path' => FauxMetheus
  end

  resources :dashboards, except: :index
  resources :servers
  resources :directories
  resources :templates
  resources :profiles

  get '/annotations', to: 'dashboards#annotations'
  get '/dashboards/:id/clone', to: 'dashboards#clone', as: :clone_dashboard
  get '/dashboards/:id/widgets', to: 'dashboards#widgets'
  get '/w/:slug', to: 'single_widget#show', as: 'single_widget'
  post '/w', to: 'single_widget#create'
  get '/permalink/:id', to: 'dashboards#show'
  post '/permalink', to: 'dashboards#permalink'
  get '/embed/:slug', to: 'embed#show'

  # TODO: MAKE THESE WORK
  # get '/w/:slug/:profile', to: 'single_widget#show'
  # get '/embed/:slug/:profile', to: 'embed#show'

  get '/:slug/:profile_slug', to: 'profiles#show', as: 'profile_slug'
  put '/:slug/:profile_slug', to: 'profiles#update'

  get '/:slug', to: 'dashboards#show', as: 'dashboard_slug'
  match '/:slug', to: 'dashboards#update', as: 'dashboard_slug_put', via: [:put, :patch]
  root 'directories#index'
end
