json.extract! @dashboard, :name, :created_at, :updated_at
json.dashboard_json JSON.parse(@dashboard.dashboard_json)
