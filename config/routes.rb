PrometheusDashboard::Application.routes.draw do
  resources :dashboards
  resources :servers

  get '/widget', to: 'single_widget#show'
  get '/embed/:slug', to: 'embed#show'
  get '/:slug', to: 'dashboards#show', as: 'dashboard_slug'
  match '/:slug', to: 'dashboards#update', as: 'dashboard_slug_put', via: [:put, :patch]
  root 'dashboards#index'
end
