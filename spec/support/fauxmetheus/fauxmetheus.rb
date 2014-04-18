require 'sinatra/base'

class FauxMetheus < Sinatra::Base

  get '/api/query_range' do
    json_response 200, 'prometheus_response.json'
  end

  get '/api/metrics' do
    json_response 200, 'metrics.json'
  end

  private

  def json_response(response_code, file_name)
    response.headers['Access-Control-Allow-Origin'] = '*'
    content_type :json
    status response_code
    File.read("./spec/support/sample_json/#{file_name}")
  end

  run! if app_file == $0
end
