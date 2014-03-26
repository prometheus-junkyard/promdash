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
end
