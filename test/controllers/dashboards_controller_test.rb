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
    d = Dashboard.new_with_slug(name: 'new dashboard')
    assert_difference('Dashboard.count') do
      post :create, dashboard: { name: d.name }
    end

    assert_redirected_to dashboard_slug_path(d.slug)
  end

  test "should show dashboard" do
    get :show, slug: @dashboard.slug
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @dashboard
    assert_response :success
  end

  test "should update dashboard" do
    patch :update, slug: @dashboard.slug, dashboard: { name: @dashboard.name }
    assert_redirected_to dashboard_slug_path(@dashboard.slug)
  end

  test "should destroy dashboard" do
    assert_difference('Dashboard.count', -1) do
      delete :destroy, id: @dashboard
    end

    assert_redirected_to dashboards_path
  end
end
