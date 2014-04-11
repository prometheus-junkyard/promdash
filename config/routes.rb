PrometheusDashboard::Application.routes.draw do
  mount JasmineRails::Engine => '/specs' if defined?(JasmineRails)
  resources :dashboards
  resources :servers

  get '/dashboards/:id/clone', to: 'dashboards#clone', as: :clone_dashboard
  get '/w/:slug', to: 'single_widget#show'
  post '/w', to: 'single_widget#create'
  get '/embed/:slug', to: 'embed#show'
  get '/:slug', to: 'dashboards#show', as: 'dashboard_slug'
  match '/:slug', to: 'dashboards#update', as: 'dashboard_slug_put', via: [:put, :patch]
  root 'dashboards#index'
end
