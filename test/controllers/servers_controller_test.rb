require 'test_helper'

class ServersControllerTest < ActionController::TestCase
  setup do
    @server = servers(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:servers)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create server" do
    assert_difference('Server.count') do
      post :create, server: { name: @server.name, url: @server.url }
    end

    assert_redirected_to server_path(assigns(:server))
  end

  test "should show server" do
    get :show, id: @server
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @server
    assert_response :success
  end

  test "should update server" do
    patch :update, id: @server, server: { name: @server.name, url: @server.url }
    assert_redirected_to server_path(assigns(:server))
  end

  test "should destroy server" do
    assert_difference('Server.count', -1) do
      delete :destroy, id: @server
    end

    assert_redirected_to servers_path
  end
end
