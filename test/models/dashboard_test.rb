require 'test_helper'

class DashboardTest < ActiveSupport::TestCase
  test "requiring a name" do
    assert_equal false, Dashboard.new.valid?
  end

  test "requiring a slug" do
    assert_equal false, Dashboard.new(name: 'dashboard name').valid?
  end

  test "making the slug" do
    d = Dashboard.new_with_slug(name: "Super Awesome Dashboard")
    assert_equal "super-awesome-dashboard", d.slug
  end

  test "cleaning a slug's name" do
    d = Dashboard.new_with_slug(name: "U_ser's Awes(()ome Dashboard!!")
    assert_equal "users-awesome-dashboard", d.slug
  end
end
