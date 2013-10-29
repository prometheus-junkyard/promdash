class Dashboard < ActiveRecord::Base
  validates :name, uniqueness: { case_sensitive: false }
  validates :name, :slug, presence: true

  def self.new_with_slug(params)
    dashboard = new(params)
    dashboard.create_slug
    dashboard
  end

  def create_slug
    self.slug = name.downcase.gsub(' ','-').gsub(/[^a-zA-Z0-9-]/, '')
  end
end
