require 'spec_helper'

describe 'Graph and Axis Settings', js: true do
  before(:each) do
    FactoryGirl.create :server
    visit dashboard_slug_path FactoryGirl.create(:dashboard).slug
    open_tab "Graph and axis settings"
  end

  describe "entering a max value" do
    it "with a second axis" do
      click_button 'Add Axis'
      maxInputs = all("[ng-model='axis.yMax']")
      maxInputs.first.set 50
      expect(maxInputs.last).to be_disabled
    end
  end

  describe "valid values" do
    it "should not be marked invalid" do
      click_button 'Add Axis'
      minInput = all("[ng-model='axis.yMin']").first
      minInput.set 30
      expect(minInput['class']).to_not include("invalid_input")
    end
  end

  describe "invalid values" do
    it "should be marked invalid" do
      click_button 'Add Axis'
      minInput = all("[ng-model='axis.yMin']").first
      minInput.set "asdf"
      expect(minInput['class']).to include("invalid_input")
    end
  end
end
