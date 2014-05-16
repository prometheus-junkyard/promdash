require 'spec_helper'

describe DashboardsController do
  before(:each) do
    @dashboard = Dashboard.new_with_slug(name: "example dashboard")
    @dashboard.dashboard_json = {'widgets' => [
      {"title"=>"Graph 1"},
      {"title"=>"Title"}
    ]}.to_json
    @dashboard.save!
  end

  it "#new" do
    get :new
    expect(response).to be_success
  end

  context "#create" do
    it "a new dashboard" do
      d = Dashboard.new_with_slug(name: "example dash")
      expect {
        post :create, dashboard: { name: d.name }
      }.to change{ Dashboard.count }.by(1)

      expect(response).to redirect_to(dashboard_slug_path(d.slug))
    end

    it "clones the dashboard given a source_id" do
      d = Dashboard.new_with_slug(name: "example dash", dashboard_json: {some: "key"}.to_json)
      d.save!
      post :create, dashboard: { name: "dashboard clone"}, source_id: d.id
      expect(Dashboard.last.dashboard_json).to eq(d.dashboard_json)
    end

    it "clones a dashboard and associates it with a directory" do
      directory = FactoryGirl.create :directory
      d = Dashboard.new_with_slug(name: "example dash", dashboard_json: {some: "key"}.to_json)
      d.save!
      post :create, dashboard: { name: "dashboard clone", directory_id: directory.id }, source_id: d.id
      expect(Dashboard.last.directory_id).to eq(directory.id)
    end
  end

  it "#show" do
    get :show, slug: @dashboard.slug
    expect(response).to be_success
  end

  it "#edit" do
    get :edit, id: @dashboard
    expect(response).to be_success
  end

  it "#update" do
    patch :update, slug: @dashboard.slug, dashboard: { name: @dashboard.name + "asdf" }
    expect(response).to redirect_to(dashboard_slug_path(@dashboard.slug))
  end

  it "#destroy" do
    expect {
      delete :destroy, id: @dashboard
    }.to change{ Dashboard.count }.by(-1)

    expect(response).to redirect_to(root_path)
  end

  context "getting widgets json" do
    it "dashboard_json exists" do
      get :widgets, id: @dashboard
      widgets = { widgets: [{title: "Graph 1"}, {title: "Title"}]}
      expect(response.body).to eq(widgets.to_json)
    end

    it "dashboard_json is nil" do
      d = Dashboard.new_with_slug name: "no dash json"
      d.save
      get :widgets, id: d
      expect(response.body).to eq({widgets:[]}.to_json)
    end
  end

  context "cloning dashboards" do
    let(:do_request) { get :clone, id: @dashboard }

    it "defaults to a different name" do
      do_request
      expect(assigns(:dashboard).name).to eq("example dashboard clone")
    end

    it "renders the new template" do
      do_request
      expect(response).to render_template('new')
    end
  end
end
