require 'slug_maker'

class Profile < ActiveRecord::Base
  belongs_to :dashboard

  validates :dashboard, presence: true
  validates :name, uniqueness: { case_sensitive: false }
  validates :name, :slug, presence: true

  validates :slug,
    format: {
      with: /\A[a-z0-9\-]+\z/,
      message: "Only alphanumeric characters connected by hyphens are allowed."
    }

  def self.new_with_slug(params)
    p = new(params)
    p.slug = SlugMaker.slug(p.name)
    p
  end
end
