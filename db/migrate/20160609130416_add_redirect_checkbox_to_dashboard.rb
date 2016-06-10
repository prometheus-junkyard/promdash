class AddRedirectCheckboxToDashboard < ActiveRecord::Migration
  def change
    add_column :dashboards, :hard_redirect, :boolean, default: false, null: false
  end
end
