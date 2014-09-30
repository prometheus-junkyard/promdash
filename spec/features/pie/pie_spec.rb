require 'spec_helper'

feature "Dashboard#show", js: true do
  describe "interacting with pie charts" do
    before(:each) do
      @server = Server.create! name: "prometheus", url: "http://localhost:#{Capybara.server_port}/"
      @dashboard = FactoryGirl.create(:dashboard)
      @unassigned_dashboard = FactoryGirl.create(:dashboard)
      FactoryGirl.create :directory, dashboards: [ @dashboard ]
      visit dashboard_slug_path @dashboard.slug

      # Remove the default chart.
      open_tab 'Remove graph'
      click_button 'Delete'
      click_button 'Add Pie Chart'
    end

    describe "changing the title" do
      it "should change the title" do
        open_tab 'Chart settings'
        title = model_element 'graph.title'
        graph_title = 'PromDash Pie Chart'
        title.set graph_title
        expect(find('.widget_title').text).to eq graph_title
      end
    end

    describe "removing pie charts" do
      before { open_tab 'Remove chart' }

      it "should remove graphs" do
        click_button 'Delete'
        expect(all('.widget_title').count).to eq 0
      end

      it "should cancel" do
        click_button 'Cancel'
        expect(all('.widget_title').count).to eq 1
      end
    end
  end
end
