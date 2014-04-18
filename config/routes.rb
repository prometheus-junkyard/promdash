PrometheusDashboard::Application.routes.draw do
  mount JasmineRails::Engine => '/specs' if defined?(JasmineRails)

  if Rails.env.test?
    require_relative '../spec/support/fauxmetheus/fauxmetheus'
    get '/api/:path' => FauxMetheus
  end

  resources :dashboards
  resources :servers

  get '/dashboards/:id/clone', to: 'dashboards#clone', as: :clone_dashboard
  get '/dashboards/:id/widgets', to: 'dashboards#widgets'
  get '/w/:slug', to: 'single_widget#show'
  post '/w', to: 'single_widget#create'
  get '/embed/:slug', to: 'embed#show'
  get '/:slug', to: 'dashboards#show', as: 'dashboard_slug'
  match '/:slug', to: 'dashboards#update', as: 'dashboard_slug_put', via: [:put, :patch]
  root 'dashboards#index'
end
