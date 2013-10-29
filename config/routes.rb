PrometheusDashboard::Application.routes.draw do
  resources :dashboards
  resources :servers

  get '/:slug', to: 'dashboards#show', as: 'dashboard_slug'
  match '/:slug', to: 'dashboards#update', as: 'dashboard_slug_put', via: [:put, :patch]
  root 'dashboards#index'
end
