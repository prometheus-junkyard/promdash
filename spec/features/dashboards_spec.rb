require "spec_helper"

feature "Dashboard" do
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
  end
end
