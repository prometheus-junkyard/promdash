class RemoveSlugColumnFromShortenedUrl < ActiveRecord::Migration
  def change
    remove_column :shortened_urls, :slug
  end
end
