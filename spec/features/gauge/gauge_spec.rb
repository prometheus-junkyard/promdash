require 'spec_helper'

feature "Dashboard#show", js: true do
  describe "interacting with gauge charts" do
    before(:each) do
      @server = Server.create! name: "prometheus", url: "http://localhost:#{Capybara.server_port}/"
      @dashboard = FactoryGirl.create(:dashboard, :gauge_chart)
      FactoryGirl.create :directory, dashboards: [ @dashboard ]
      visit dashboard_slug_path @dashboard.slug
    end

    describe "changing the gauge settings" do
      it "should change the title" do
        open_tab 'Chart settings'
        title = model_element 'graph.title'
        graph_title = 'PromDash Gauge Chart'
        title.set graph_title
        expect(find('.widget_title').text).to eq graph_title
      end

      it "should change the precision" do
        open_tab 'Chart settings'
        el = model_element 'graph.precision'
        precision = 2
        el.set precision
        find('.glyphicon-refresh').click()
        gaugeNumber = find('text').text.split().first
        expect(gaugeNumber).to eq '699.80'
      end

      it "should change the units" do
        open_tab 'Chart settings'
        el = model_element 'graph.units'
        units = 'fahrquads'
        el.set units
        open_tab 'Refresh'
        within '.gauge_chart' do
          expect(page).to have_content units
        end
      end
    end

    describe "removing gauge charts" do
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
