PrometheusDashboard::Application.routes.draw do
  mount JasmineRails::Engine => '/specs' if defined?(JasmineRails)
  resources :dashboards
  resources :servers

  get '/widget', to: 'single_widget#show'
  get '/embed/:slug', to: 'embed#show'
  get '/:slug', to: 'dashboards#show', as: 'dashboard_slug'
  match '/:slug', to: 'dashboards#update', as: 'dashboard_slug_put', via: [:put, :patch]
  root 'dashboards#index'
end
