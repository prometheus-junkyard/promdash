json.array!(@dashboards) do |dashboard|
  json.extract! dashboard, :name
  json.url dashboard_url(dashboard, format: :json)
end
