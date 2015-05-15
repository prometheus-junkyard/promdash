require 'spec_helper'

feature "Dashboard Global Config", js: true do
  describe "interacting with graphs" do
    before(:each) do
      @server = Server.create! name: "prometheus", url: "http://localhost:#{Capybara.server_port}/"
      @dashboard = FactoryGirl.create(:dashboard)
      @unassigned_dashboard = FactoryGirl.create(:dashboard)
      FactoryGirl.create :directory, dashboards: [ @dashboard ]
      visit dashboard_slug_path @dashboard.slug

      # Should this just be set in the dashboard_json file?
      open_tab 'Graph and axis settings'
      title = model_element 'graph.title'
      graph_title = '{{title}}'
      title.set graph_title
      open_tab 'Graph and axis settings'
      open_global_config
      page.check('Manage profiles')
      open_global_config
    end

    describe "profiles" do
      it "adds profiles" do
        click_tooltip('Add a new profile')
        within '.profile_container' do
          expect(page).to have_text 'Profile0'
        end
      end

      it "removes profiles" do
        click_tooltip('Add a new profile')
        find('.profile_container').hover

        click_tooltip 'Delete'
        expect(page).to have_no_text 'Profile0'
      end

      describe "changing profiles names" do
        before :each do
          click_tooltip('Add a new profile')
          find('.profile_container').hover

          click_tooltip 'Edit'
          model_element('editName').set 'myProfile'
          model_element('editName').hover
        end

        it "changes profile names" do
          profile_name = 'myProfile'
          click_tooltip 'Confirm change'
          within '.profile_container' do
            expect(page).to have_text profile_name
          end
          uri = URI.parse(current_url)
          expect(uri.path).to eq("/#{@dashboard.slug}/#{profile_name}")
        end

        it "cancels name changes" do
          click_tooltip 'Cancel'
          within '.profile_container' do
            expect(page).to have_text 'Profile0'
          end
        end
      end

      describe "multiple profiles" do
        before :each do
          2.times { click_tooltip('Add a new profile') }
        end

        it "should have two profiles available" do
          expect(all('.profile_container').length).to eq 2
        end

        it "should change the url depending on profile" do
          uri1 = URI.parse(current_url)
          click_tooltip('Set Profile0 as active profile')
          uri2 = URI.parse(current_url)
          expect(uri1.path).to_not eq(uri2.path)
        end

        it "should switch profiles when not in manage mode" do
          open_global_config
          page.uncheck('Manage profiles')
          open_global_config

          all('.dropdown-toggle').first.click
          profile = all('.dropdown-menu li').first
          profile_name = profile.text

          uri = URI.parse(current_url)
          expect(uri.path).to_not eq("/#{@dashboard.slug}/#{profile_name}")
          profile.click

          uri = URI.parse(current_url)
          expect(uri.path).to eq("/#{@dashboard.slug}/#{profile_name}")
        end
      end

      describe "variables" do
        before :each do
          click_tooltip('Add a new profile')
          click_tooltip('Add profile variable')
        end

        it "adds variables" do
          name = model_element 'p.name'
          name.set 'title'

          title = 'profile test'
          name = model_element 'p.value'
          name.set title

          within '.widget_title' do
            expect(page).to have_content title
          end
        end

        it "updates when switching profiles" do
          name = model_element 'p.name'
          name.set 'title'

          title = 'profile test'
          name = model_element 'p.value'
          name.set title

          click_tooltip('Add a new profile')
          second_title = 'second title'
          name = model_element 'p.value'
          name.set second_title

          within '.widget_title' do
            expect(page).to have_content second_title
          end
        end
      end
    end
  end
end

