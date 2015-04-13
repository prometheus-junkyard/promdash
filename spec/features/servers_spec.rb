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

  describe 'editing the dashboard' do
    before(:each) do
      s = Server.create! name: 'New Server', url: "prometheus.server.com"
      s.save!
      visit servers_path
    end

    scenario 'the name' do
      click_link('Edit')
      find('#server_name').set('some other name')
      click_button('Update Server')
      expect(page).to have_content(/successfully updated/)
      expect(page).to have_content(/some other name/)
    end

    scenario 'the url' do
      click_link('Edit')
      find('#server_url').set('prom.server.com:{{port}}/')
      click_button('Update Server')
      expect(page).to have_content(/successfully updated/)
      expect(page).to have_content(/prom.server.com:{{port}}/)
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
