require 'spec_helper'

describe DirectoriesController do
  before(:each) do
    FactoryGirl.create :directory
    2.times { FactoryGirl.create :dashboard }
  end

  it "#index" do
    get :index
    expect(response).to be_success
    expect(assigns(:directories)).to_not be_nil
  end

  describe "destroy" do
    it "destroys the directory" do
      expect {
        delete :destroy, id: Directory.last.id
      }.to change{ Directory.count }.by -1
      expect(response).to redirect_to(root_path)
    end

    it "unassociates its dashboards" do
      dir = FactoryGirl.create :directory,
        dashboards: [ FactoryGirl.create(:dashboard) ]
      expect {
        delete :destroy, id: dir.id
      }.to change{ Directory.count }.by -1

      dashboard = dir.dashboards.first.reload
      expect(dashboard.directory_id).to be_nil
    end
  end

  it "#new" do
    get :new
    expect(response).to be_success
    expect(assigns(:directory)).to_not be_nil
    expect(assigns(:unassigned_dashboards)).to_not be_nil
  end

  describe "edit" do
    let(:directory) { Directory.last }

    it "renames the dashboard" do
      patch :update, {id: directory.id, directory: { name: "A different name" }}

      expect(response).to redirect_to(root_path)
      expect(directory.reload.name).to eq "A different name"
    end

    it "removes dashboards" do
      Dashboard.last.update_attribute(:directory_id, directory.id)
      patch :update, {id: directory.id, directory: { name: directory.name }}

      expect(response).to redirect_to(root_path)
      expect(directory.reload.dashboards).to be_empty
    end
  end

  describe "create" do
    it "without any dashboards associated" do
      expect {
        post :create, directory: { name: "Some Directory" }
      }.to change{ Directory.count }.by 1

      expect(response).to redirect_to(root_path)
    end

    it "with dashboards associated" do
      expect {
        post :create, directory: { name: "Some Directory", dashboard_ids: [1,2] }
      }.to change{ Directory.count }.by 1

      expect(Directory.last.dashboards.pluck(:id)).to match_array [1,2]
    end
  end
end
