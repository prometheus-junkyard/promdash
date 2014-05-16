require "spec_helper"

feature "Directory", js: true do
  describe "the index" do
    before do
      2.times { FactoryGirl.create :dashboard }
      visit directories_path
    end

    scenario "visiting the directory index" do
      expect(page).to have_content(/dashboards/i)
    end

    scenario "with unassigned dashboards" do
      expect(page).to have_content(/unassigned dashboards/i)
    end

    scenario "with assigned dashboards" do
      FactoryGirl.create :directory, dashboard_ids: Dashboard.pluck(:id)
      visit current_path
      expect(page).to have_no_content(/unassigned dashboards/i)
    end
  end

  scenario "visiting the directory new page" do
    visit directories_path
    click_button("New Directory")
    expect(page).to have_content("New directory")
  end


  describe "creating a directory" do
    scenario "without any dashboards" do
      visit new_directory_path
      fill_in('Name', with: 'New Directory')
      find('.actions input').click
      expect(page).to have_content(/successfully created/)
      expect(page).to have_content(/new directory/i)
    end

    scenario "with unassigned dashboards" do
      2.times { FactoryGirl.create :dashboard }
      visit new_directory_path
      fill_in('Name', with: 'New Directory')
      all('[type=checkbox]').each {|c| c.set true }
      find('.actions input').click
      expect(page).to have_content(/successfully created/)
      expect(page).to have_content(/new directory/i)
      within '.directory_container' do
        Dashboard.pluck(:name).each do |name|
        expect(page).to have_content(name)
        end
      end
    end
  end

  describe "editing the directory" do
    before(:each) do
      FactoryGirl.create :directory
      visit directories_path
      find('.icon-pencil').click
    end

    describe "the name" do
      scenario "valid" do
        fill_in('Name', with: 'Renamed Dashboard')
        click_button("Update Directory")
        expect(page).to have_content(/successfully updated/)
        expect(page).to have_content(/renamed dashboard/i)
      end

      scenario "invalid" do
        fill_in('Name', with: '')
        click_button("Update Directory")
        expect(page).to have_content(/error/)
        expect(page).to have_content(/editing directory/i)
      end
    end

    describe "associated dashboards" do
      before(:each) do
        2.times { FactoryGirl.create :dashboard, directory_id: Directory.last.id }
        visit current_path
      end

      scenario "dashboards should be selected" do
        all('[type=checkbox]').each do |cb|
          expect(cb).to be_checked
        end
      end

      scenario "dashboards should be selected" do
        all('[type=checkbox]').last.set false
        click_button("Update Directory")
        within all('.directory_container').first do
          expect(page).to_not have_content(Dashboard.last.name)
        end
      end
    end
  end

  scenario "destroy" do
    FactoryGirl.create :directory
    visit directories_path
    expect {
      find(".icon-trash").click
      accept_alert
      # need to wait for the request to complete
      sleep 0.3
    }.to change { Directory.count }.by(-1)
  end
end
