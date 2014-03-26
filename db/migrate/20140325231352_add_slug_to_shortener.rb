class AddSlugToShortener < ActiveRecord::Migration
  def change
    add_column :shortened_urls, :slug, :string
  end
end
