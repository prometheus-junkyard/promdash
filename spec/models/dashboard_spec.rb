require "spec_helper"

describe Dashboard do
  context "validations" do
    it "requires a name" do
      d = Dashboard.new
      expect(d).to_not be_valid
    end
    it "requires a slug" do
      d = Dashboard.new(name: 'dashboard name')
      expect(d).to_not be_valid
    end
    it "won't save an invalid slug" do
      d = Dashboard.new(name: "dashboard", slug: "bad!_ slug())")
      expect(d).to_not be_valid
    end
    it "doesn't make blacklisted slug names" do
      d = Dashboard.new_with_slug(name: "dashboard")
      expect(d).to_not be_valid
    end
  end

  context "slug" do
    it "makes the slug" do
      d = Dashboard.new_with_slug(name: "Super Awesome Dashboard")
      expect(d.slug).to eq("super-awesome-dashboard")
    end
    it "cleans the dashboard name to create the slug" do
      d = Dashboard.new_with_slug(name: "U_ser's Awes(()ome Dashboard!!")
      expect(d.slug).to eq("users-awesome-dashboard")
    end
  end
end
