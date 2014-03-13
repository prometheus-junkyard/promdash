require "spec_helper"

describe ServersController do
  before(:each) do
    @server = Server.new
    @server.save
  end

  it "#index" do
    get :index
    expect(response).to be_success
    expect(assigns(:servers)).to_not be_nil
  end

  it "#new" do
    get :new
    expect(response).to be_success
    expect(assigns(:server)).to_not be_nil
  end

  it "#create" do
    s = Server.new name: "New Server", url: "localhost:9000"
    expect {
      post :create, server: { name: s.name, url: s.url }
    }.to change { Server.count }.by(1)

    expect(response).to redirect_to(server_path(assigns(:server)))
  end

  it "#show" do
    get :show, id: @server.id
    expect(response).to be_success
    expect(assigns(:server)).to eq(@server)
  end

  it "#edit" do
    get :edit, id: @server.id
    expect(response).to be_success
    expect(assigns(:server)).to eq(@server)
  end

  it "#update" do
    patch :update, id: @server, server: { name: @server.name, url: @server.url }
    expect(response).to redirect_to server_path(assigns(:server))
  end

  it "#destroy" do
    expect {
      delete :destroy, id: @server
    }.to change { Server.count }.by(-1)

    expect(response).to redirect_to servers_path
  end
end
