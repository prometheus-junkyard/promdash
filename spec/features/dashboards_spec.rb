require "spec_helper"

feature "Dashboard", js: true do
  scenario "visiting the dashboard index" do
    visit root_path
    expect(page.has_content?("Dashboards")).to eq(true)
  end

  scenario "visiting the dashboard new page" do
    visit root_path
    click_button("New Dashboard")
    expect(page).to have_content("New dashboard")
  end

  scenario "creating the dashboard" do
    visit new_dashboard_path
    fill_in('Name', with: 'New Dashboard')
    find('.actions input').click
    expect(page).to have_content(/successfully created/)
    expect(page).to have_content(/new dashboard/i)
    visit root_path
    expect(page).to have_content(/new dashboard/i)
  end

  describe "cloning the dashboard" do
    before(:each) do
      d = Dashboard.new_with_slug name: 'New Dashboard'
      d.save!
    end

    scenario "go to the new page" do
      visit root_path
      click_link 'Clone'
      expect(page).to have_content(/new dashboard/i)
    end
  end

  describe "editing the dashboard" do
    before(:each) do
      d = Dashboard.new_with_slug name: 'New Dashboard'
      d.save!
      visit root_path
    end

    describe "the name" do
      scenario "valid" do
        click_link('Rename')
        find("#dashboard_name").set("some other name")
        click_button("Update Dashboard")
        expect(page).to have_content(/successfully updated/)
        expect(page).to have_content(/some other name/)
      end

      scenario "invalid" do
        click_link('Rename')
        find("#dashboard_name").set("")
        click_button("Update Dashboard")
        expect(page).to have_content(/error/)
        expect(page).to have_content(/editing dashboard/i)
      end
    end

    describe "the slug" do
      scenario "valid" do
        click_link('Rename')
        find("#dashboard_slug").set("valid-slug-name")
        click_button("Update Dashboard")
        expect(page).to have_content(/successfully updated/)
        expect(current_url).to include("valid-slug-name")
      end

      scenario "invalid" do
        click_link('Rename')
        find("#dashboard_slug").set("invalid slug name")
        click_button("Update Dashboard")
        expect(page).to have_content(/error/)
        expect(page).to have_content(/editing dashboard/i)
      end
    end
  end

  scenario "destroy" do
    d = Dashboard.new_with_slug name: 'New Dashboard'
    d.save!
    visit root_path
    expect {
      click_link('Delete')
      accept_alert
      # need to wait for the request to complete
      sleep 0.3
    }.to change { Dashboard.count }.by(-1)
  end
end
