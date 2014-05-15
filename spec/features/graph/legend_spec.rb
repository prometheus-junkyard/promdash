require 'spec_helper'

feature "Graph legend", js: true do
  before(:each) {
    @server = Server.create! name: "prometheus", url: "http://localhost:#{Capybara.server_port}/"
  }

  describe "general behavior" do
    before(:each) do
      @dashboard =
        Dashboard.create! name: "Sample Dash", slug: "sample-dash", dashboard_json: File.read('./spec/support/sample_json/2_expression_dashboard_json')
      visit dashboard_slug_path @dashboard.slug
    end

    it "shows the default legend string when one is removed" do
      open_tab 'Legend Settings'
      all('.legend_string_container .icon-cross').each(&:click)
      within_graph do
        expect(page).to have_content "prometheus_targetpool_duration_ms"
      end
    end
  end

  describe "two legend strings" do
    before(:each) do
      @dashboard =
        Dashboard.create! name: "Sample Dash", slug: "sample-dash", dashboard_json: File.read('./spec/support/sample_json/2_expression_dashboard_json')
      visit dashboard_slug_path @dashboard.slug
    end

    it "has both legend strings" do
      within_graph do
        expect(page).to have_content "string 1"
        expect(page).to have_content "string 2"
      end
    end

    it "interpolates both strings" do
      open_tab 'Legend Settings'
      legend_inputs = all '.legend_string_input'
      input1 = legend_inputs[0]
      input2 = legend_inputs[1]

      input1.set '{{quantile}}'
      input2.set '{{quantile | toPercent}}'

      within_graph do
        %w{0.99 0.9 0.5 0.05 0.01}.each do |quantile|
          expect(page).to have_content quantile
        end
        %w{99% 90% 50% 5% 1%}.each do |quantile|
          expect(page).to have_content quantile
        end
      end
    end
  end

  describe "one legend string" do
    before(:each) do
      @dashboard =
        Dashboard.create! name: "Sample Dash", slug: "sample-dash", dashboard_json: File.read('./spec/support/sample_json/1_expression_dashboard_json')
      visit dashboard_slug_path @dashboard.slug
    end

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
      let(:legend_string) { find '.legend_string_input' }

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
end

