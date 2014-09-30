require 'spec_helper'

feature "Graph legend", js: true do
  before(:each) { FactoryGirl.create :server }

  describe "legend string" do
    before(:each) do
      visit dashboard_slug_path FactoryGirl.create(:dashboard, :pie_chart).slug
    end

    it "should show the legend" do
      within_graph do
        expect(page).to have_content "cpu_idle"
      end
    end

    it "should be able to turn off the legend" do
      open_tab 'Legend Settings'
      choose 'never'
      within_graph do
        expect(page).to have_no_content "cpu_idle"
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
        legend_string.set '{{owner}}'
        within_graph do
          expect(page).to have_content "iss"
        end
      end

      it "single piped interpolation" do
        legend_string.set '{{instance | hostname}}'
        within_graph do
          expect(page).to have_content "xen-10-20-2-193"
        end
      end

      describe "regex interpolation" do
        it "acceptable string" do
          legend_string.set '{{job | regex:"bazooka":"harpoon"}}'
          within_graph do
            expect(page).to have_content "harpoon-system"
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

