require 'sinatra/base'

class FauxMetheus < Sinatra::Base

  get '/api/query_range' do
    json_response 200, 'prometheus_response_query_range.json'
  end

  get '/api/query' do
    if params[:expr] == 'scalar(rate(prometheus_local_storage_ingested_samples_total[5m]))'
      return json_response 200, 'prometheus_response_scalar.json'
    end
    json_response 200, 'prometheus_response_query.json'
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
