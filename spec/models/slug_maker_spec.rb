require "spec_helper"
require "slug_maker"

describe SlugMaker do
  it "makes the slug" do
    d = Dashboard.new_with_slug(name: "Super Awesome Dashboard")
    expect(d.slug).to eq("super-awesome-dashboard")
  end

  it "cleans the dashboard name to create the slug" do
    d = Dashboard.new_with_slug(name: "U_ser's Awes(()ome Dashboard!!")
    expect(d.slug).to eq("users-awesome-dashboard")
  end
end
