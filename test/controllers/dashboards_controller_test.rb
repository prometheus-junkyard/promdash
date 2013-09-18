require 'test_helper'

class DashboardsControllerTest < ActionController::TestCase
  setup do
    @dashboard = dashboards(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:dashboards)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create dashboard" do
    assert_difference('Dashboard.count') do
      post :create, dashboard: { name: @dashboard.name }
    end

    assert_redirected_to dashboard_path(assigns(:dashboard))
  end

  test "should show dashboard" do
    get :show, id: @dashboard
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @dashboard
    assert_response :success
  end

  test "should update dashboard" do
    patch :update, id: @dashboard, dashboard: { name: @dashboard.name }
    assert_redirected_to dashboard_path(assigns(:dashboard))
  end

  test "should destroy dashboard" do
    assert_difference('Dashboard.count', -1) do
      delete :destroy, id: @dashboard
    end

    assert_redirected_to dashboards_path
  end
end
