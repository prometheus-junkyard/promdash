class AssociateShortenedUrlAndDashboard < ActiveRecord::Migration
  def change
    add_column :shortened_urls, :dashboard_id, :integer
  end
end
