require "spec_helper"

describe Directory do
  context "anchors" do
    it "transforms directory names into anchors correctly" do
      d = Directory.new(name: "TEST-dashboard--&--a^b--n4m3-!@#")
      expect(d.anchor_name).to eq("test-dashboard-a-b-n4m3")
    end
  end
end
