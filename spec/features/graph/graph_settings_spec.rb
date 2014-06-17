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
    %w{30 >=30 <=30}.each do |v|
      it "is valid with #{v}" do
        click_button 'Add Axis'
        minInput = all("[ng-model='axis.yMin']").first
        minInput.set v
        expect(minInput['class']).to_not include("invalid_input")
      end
    end

    it "is valid after adding and then removing a value" do
      click_button 'Add Axis'
      minInput = all("[ng-model='axis.yMin']").first
      minInput.set "asdf"
      expect(minInput['class']).to include("invalid_input")
      minInput.set ""
      page.execute_script %Q{ $('[ng-model="axis.yMin"]').trigger("keyup") }
      expect(minInput['class']).to_not include("invalid_input")
    end
  end

  describe "invalid values" do
    %w{asdf >=asdf foo>=23 <=asdf foo<=23 >bar <baz}.each do |v|
      it "is invalid with #{v}" do
        click_button 'Add Axis'
        minInput = all("[ng-model='axis.yMin']").first
        minInput.set v
        expect(minInput['class']).to include("invalid_input")
      end
    end
  end
end
