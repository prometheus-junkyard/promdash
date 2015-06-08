require 'spec_helper'

feature 'Server', js: true do
  scenario 'visiting the server new page' do
    visit servers_path
    click_button('New Server')
    expect(page).to have_content('New server')
  end

  describe 'creating a server' do
    ['prometheus.server.com', '{{zone}}.server.com'].each do |url|
      scenario 'urls' do
        s = Server.create! name: 'New Server', url: url
        visit servers_path
        expect(page).to have_content s.url
        visit server_path(s)
        expect(page).to have_content s.url
      end
    end
  end

  describe "container css" do
    scenario "index page" do
      FactoryGirl.create(:server)
      visit servers_path
      expect(page).to have_css ".container"
    end
  end

  describe 'creating a dashboard' do
    scenario 'prometheus backend' do
      visit servers_path
      click_button('New Server')
      fill_in('Name', :with => 'John')
      fill_in('Url', :with => 'http://prometheus.com/')
      click_button('Create Server')
      expect(page).to have_content("Server type: Prometheus")
    end

    scenario 'graphite backend' do
      visit servers_path
      click_button('New Server')
      fill_in('Name', :with => 'John')
      fill_in('Url', :with => 'http://graphite.com/')
      select('Graphite', :from => 'server[server_type]')
      click_button('Create Server')
      expect(page).to have_content("Server type: Graphite")
    end
  end

  describe 'editing the dashboard' do
    before(:each) do
      FactoryGirl.create(:server)
      visit servers_path
    end

    scenario 'the name' do
      click_link('Edit')
      fill_in('Name', :with => 'some other name')
      click_button('Update Server')
      expect(page).to have_content(/successfully updated/)
      expect(page).to have_content(/some other name/)
    end

    scenario 'the url' do
      click_link('Edit')
      fill_in('Url', :with => 'prom.server.com:{{port}}/')
      click_button('Update Server')
      expect(page).to have_content(/successfully updated/)
      expect(page).to have_content(/prom.server.com:{{port}}/)
    end

    scenario 'the server_type' do
      click_link('Edit')
      select('Graphite', :from => 'server[server_type]')
      click_button('Update Server')
      expect(page).to have_content("Server type: Graphite")
    end

    scenario 'destroy' do
      expect {
        click_link('Delete')
        accept_alert
        # need to wait for the request to complete
        sleep 0.3
      }.to change { Server.count }.by(-1)
    end
  end
end
