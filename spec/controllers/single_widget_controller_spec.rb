require "spec_helper"

describe SingleWidgetController do
  before(:each) do
    @dashboard = Dashboard.create name: "example dash", slug: "example-dash"
    @params = {
      encoded_url: "some_url",
      dashboard_name: "example dash",
      graph_title: "some title",
      last_accessed: Time.now
    }
  end

  describe "#show" do
    it "doesn't blow up if there is no associated dashboard" do
      shortened_url = ShortenedUrl.create_from_encoded_url "some_url"
      expect {
        get :show, {slug: shortened_url.to_param}
      }.to_not raise_error
      expect(response).to be_success
    end

    it "assigns the graph data blob" do
      shortened_url = @dashboard.shortened_urls.create_from_encoded_url "some_url"
      get :show, {slug: shortened_url.to_param}
      expect(assigns(:blob)).to eq(shortened_url.encoded_url)
    end
  end

  describe "#create" do
    it "creates a new ShortenedUrl" do
      expect {
        post :create, @params
      }.to change{ ShortenedUrl.count }.by(1)
    end

    it "returns a JSON object with the widget slug" do
      post :create, @params

      expected_response = {
        id: SlugMaker.slug("#{ShortenedUrl.last.id} #{@params[:dashboard_name]} #{@params[:graph_title]}")
      }.to_json

      expect(response.body).to eq(expected_response)
    end
  end
end
