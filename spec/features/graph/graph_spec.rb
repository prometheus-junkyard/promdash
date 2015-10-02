require 'spec_helper'

feature "Dashboard#show", js: true do
  describe "interacting with graphs" do
    before(:each) do
      @server = Server.create! name: "prometheus", url: "http://localhost:#{Capybara.server_port}/"
      @dashboard = FactoryGirl.create(:dashboard)
      @unassigned_dashboard = FactoryGirl.create(:dashboard)
      FactoryGirl.create :directory, dashboards: [ @dashboard ]
      visit dashboard_slug_path @dashboard.slug
    end

    it "graph should exist" do
      expect(page).to have_selector '.graph_chart > svg'
    end

    describe "single widget link" do
      it "should generate a link" do
        open_tab 'Link to Graph'
        widget_link = model_element 'widgetLink'
        shortened_url = ShortenedUrl.last
        if shortened_url.nil?
          # The request to make the ShortenedUrl sometimes is slower than the
          # spec. Give the request an extra 0.3 seconds to finish if this is
          # the case.
          sleep 0.3
          shortened_url = ShortenedUrl.last
        end
        expect(widget_link.value).to match /#{shortened_url.id}-#{@dashboard.slug}/
      end
    end

    describe "changing the title" do
      it "should change the title" do
        open_tab 'Graph and axis settings'
        title = model_element 'graph.title'
        graph_title = 'PromDash Test Graph'
        title.set graph_title
        expect(find('.widget_title').text).to eq graph_title
      end
    end

    describe "removing widgets" do
      describe "graphs" do
        before { open_tab 'Remove graph' }

        it "should remove graphs" do
          click_button 'Delete'
          expect(all('.widget_title').count).to eq 0
        end

        it "should cancel" do
          click_button 'Cancel'
          expect(all('.widget_title').count).to eq 1
        end
      end

      describe "frames" do
        before do
          open_tab 'Remove graph'
          click_button 'Delete'
          click_button 'Add Frame'
        end

        it "should allow canceling on frame creation" do
          dismiss_alert
          expect(all('.widget_title').count).to eq 0
        end

        it "should remove frames" do
          accept_alert
          open_tab 'Remove frame'
          click_button 'Delete'
          expect(all('.widget_title').count).to eq 0
        end

        it "should cancel" do
          accept_alert
          open_tab 'Remove frame'
          click_button 'Cancel'
          expect(all('.widget_title').count).to eq 1
        end

      end
    end

    describe "adding widgets" do
      it "should add graphs" do
        click_button 'Add Graph'
        expect(all('.widget_title').count).to eq 2
      end

      it "should add frames" do
        click_button 'Add Frame'
        accept_alert
        expect(all('.widget_title').count).to eq 2
      end

      describe "cloning" do
        before(:each) do
          click_button 'Clone Widget'
        end

        it "clones widgets" do
          click_button 'Clone'
          expect(all('.widget_title').count).to eq 2
        end

        it "doesn't show directories without dashboards" do
          directory = FactoryGirl.create :directory
          visit current_url
          click_button 'Clone Widget'
          select = model_element 'directoryForClone'
          within select do
            expect(page).to have_no_content directory.name
          end
        end

        it "automatically selects the current dashboard" do
          select = model_element 'dashboardForClone'
          expect(select.text).to eq(@dashboard.name)
        end

        it "automatically selects the first graph" do
          select = model_element 'widgetToClone'
          expect(select.text).to eq(find('.widget_title').text)
        end

        it "lets you select from unassigned dashboards" do
          select = model_element 'directoryForClone'
          select.find('option', text: 'Unassigned dashboards').select_option
          select = model_element 'dashboardForClone'
          expect(select.text).to eq(@unassigned_dashboard.name)
        end
      end
    end
  end
end
