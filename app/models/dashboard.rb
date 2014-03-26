require 'slug_maker'

class Dashboard < ActiveRecord::Base
  validates :name, uniqueness: { case_sensitive: false }
  validates :name, :slug, presence: true
  validate :acceptable_slug
  validates :slug,
    format: {
    with: /\A[a-z0-9\-]+\z/,
    message: "Only alphanumeric characters connected by hyphens allowed"
  }

  def self.new_with_slug(params)
    dashboard = new(params)
    dashboard.create_slug
    dashboard
  end

  def acceptable_slug
    if black_listed_slug_names.include? slug
      errors.add(:slug, "Reserved name")
    end
  end

  def black_listed_slug_names
    %w(dashboard servers about help signin signout home contact assets w)
  end

  def create_slug
    self.slug = SlugMaker.slug(name)
  end
end
