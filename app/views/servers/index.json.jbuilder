json.array!(@servers) do |server|
  json.extract! server, :id, :name, :url
  #json.url server_url(server, format: :json)
end
