require "spec_helper"

feature "Dashboard", js: true do
  scenario "visiting the dashboard new page" do
    visit root_path
    click_button("New Dashboard")
    expect(page).to have_content("New dashboard")
  end

  scenario "creating the dashboard" do
    directory = FactoryGirl.create :directory
    visit new_dashboard_path
    fill_in('Name', with: 'New Dashboard')
    select directory.name
    find('.actions input').click
    expect(page).to have_content(/successfully created/)
    expect(page).to have_content(/new dashboard/i)
    visit root_path
    within '.directory_container' do
      expect(page).to have_content(/new dashboard/i)
    end
  end

  describe "cloning the dashboard" do
    before(:each) do
      directory = FactoryGirl.create :directory
      d = Dashboard.new_with_slug name: 'New Dashboard', directory_id: directory.id
      d.save!
    end

    scenario "clone by default is on original directory" do
      visit root_path
      click_link 'Clone'
      find('.actions input').click
      visit root_path
      within '.directory_container' do
        expect(page).to have_content(/new dashboard clone/i)
      end
    end

    scenario "clone can be moved to a new directory" do
      directory = FactoryGirl.create :directory
      visit root_path
      click_link 'Clone'
      select directory.name
      find('.actions input').click
      visit root_path
      within all('.directory_container').last do
        expect(page).to have_content(/new dashboard clone/i)
      end
    end

    scenario "go to the new page" do
      visit root_path
      click_link 'Clone'
      expect(find("#dashboard_name").value).to eq("New Dashboard clone")
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
