require 'spec_helper'

feature "Dashboard#show", js: true do
  describe "frame widgets" do
    before(:each) do
      @server = Server.create! name: "prometheus", url: "http://localhost:#{Capybara.server_port}/"
      @dashboard = FactoryGirl.create(:dashboard)
      FactoryGirl.create :directory, dashboards: [ @dashboard ]
      visit dashboard_slug_path @dashboard.slug
      # Remove the currently existing graph.
      open_tab 'Remove graph'
      click_button 'Delete'
    end

    describe "with malformed URIs" do
      let(:url) {'http://graphite.net/render?target=stacked(summarize(stats_counts.token.success.*,%2"1min"))'}
      before :each do
        click_button 'Add Frame'
        fill_in_prompt url
        within '.frame_container' do
          expect(page).to have_content "Error"
        end
      end

      it "can still be interacted with" do
        open_tab 'Frame Source'
        frame_element = model_element('frame.url')
        expect(frame_element.value).to eq(url)
        frame_element.set ""
        expect(frame_element.value).to eq("")
      end

      it "can still be deleted" do
        open_tab 'Remove frame'
        click_button 'Delete'
        expect(all('.widget_title').count).to eq 0
      end
    end
  end
end
