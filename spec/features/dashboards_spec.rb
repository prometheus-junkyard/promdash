require "spec_helper"

feature "Dashboard" do
  scenario "visiting the dashboard index" do
    visit root_path
    expect(page.has_content?("Dashboards")).to eq(true)
  end
end
