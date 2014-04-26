require 'spec_helper'

feature "Dashboard#show", js: true do
  describe "interacting with graphs" do
    before(:each) do
      @server = Server.create! name: "prometheus", url: "http://localhost:#{Capybara.server_port}/"
      @dashboard =
        Dashboard.create! name: "Sample Dash", slug: "sample-dash", dashboard_json: File.read('./spec/support/sample_json/dashboard_json')
      visit dashboard_slug_path @dashboard.slug
    end

    it "graph should exist" do
      expect(page).to have_selector '.graph_chart > svg'
    end

    describe "the legend" do
      it "should show the legend" do
        within_graph do
          expect(page).to have_content "prometheus_targetpool_duration_ms"
        end
      end

      it "should be able to turn off the legend" do
        open_tab 'Legend Settings'
        choose 'never'
        within_graph do
          expect(page).to have_no_content "prometheus_targetpool_duration_ms"
        end
      end

      describe "legend format string" do
        before(:each) { open_tab 'Legend Settings' }
        let(:legend_string) { model_element 'graph.legendFormatString' }

        it "constants" do
          legend_string.set 'Hello'
          within_graph do
            expect(page).to have_content 'Hello'
          end
        end

        it "single interpolation" do
          legend_string.set '{{quantile}}'
          within_graph do
            %w{0.99 0.9 0.5 0.05 0.01}.each do |quantile|
              expect(page).to have_content quantile
            end
          end
        end

        it "single piped interpolation" do
          legend_string.set '{{quantile | toPercent}}'
          within_graph do
            %w{99% 90% 50% 5% 1%}.each do |quantile|
              expect(page).to have_content quantile
            end
          end
        end

        it "double piped interpolation" do
          legend_string.set '{{quantile | toPercent}} {{quantile | toPercent}}'
          within_graph do
            ["99% 99%", "90% 90%", "50% 50%", "5% 5%", "1% 1%"].each do |quantile|
              expect(page).to have_content quantile
            end
          end
        end

        describe "regex interpolation" do
          it "acceptable string" do
            legend_string.set '{{job | regex:"pro":"faux"}}'
            within_graph do
              expect(page).to have_content "fauxmetheus"
            end
          end

          it "bad string" do
            legend_string.set '{{job | regex:"pro":"}}'
            within_graph do
              expect(page).to have_content "undefined"
            end
          end
        end
      end
    end

    describe "single widget link" do
      it "should generate a link" do
        open_tab 'Link to Graph'
        widget_link = model_element 'widgetLink'
        shortened_url = ShortenedUrl.last
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

        it "automatically selects the current dashboard" do
          select = model_element 'dashboardForClone'
          expect(select.text).to eq(@dashboard.name)
        end

        it "automatically selects the first graph" do
          select = model_element 'widgetToClone'
          expect(select.text).to eq(find('.widget_title').text)
        end
      end
    end
  end
end
