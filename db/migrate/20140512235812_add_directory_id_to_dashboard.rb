class AddDirectoryIdToDashboard < ActiveRecord::Migration
  def change
    add_reference :dashboards, :directory, index: true
  end
end
