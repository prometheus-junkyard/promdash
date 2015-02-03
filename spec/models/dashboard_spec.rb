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
    it "makes permalink dashboards" do
      d = Dashboard.new_permalink(name: "static dashboard")
      expect(d).to be_valid
    end
  end

  context "scopes" do
    before(:each) do
      %w{c t r a}.each {|name| Dashboard.create! name: name, slug: "#{name}-slug" }
    end

    it "sorts alphabetically" do
      expect(Dashboard.alphabetical.map &:name).to eq %w{a c r t}
    end

    it "only returns dashboards with widgets for cloning" do
      dashboards = Dashboard.take(2)
      dashboards.each do |d|
        d.update_attribute :dashboard_json, {some: "json"}.to_json
      end
      expect(Dashboard.cloneable.map &:id).to match_array(dashboards.map &:id)
    end
  end
end
