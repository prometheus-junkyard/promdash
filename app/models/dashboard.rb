require 'slug_maker'

class DashboardJSONValidator < ActiveModel::Validator
  def validate(record)
    return unless record.dashboard_json
    errors = JSON::Validator.fully_validate('dashboard_schema.json', record.dashboard_json, :validate_schema => true)
    if !errors.empty?
      errors.each do |e|
        record.errors[:dashboard_json] << e
      end
    end
  end
end

class Dashboard < ActiveRecord::Base
  belongs_to :directory
  has_many :shortened_urls, dependent: :destroy
  has_many :profiles, dependent: :destroy

  validates :name, uniqueness: { case_sensitive: false }
  validates :name, :slug, presence: true
  validate :acceptable_slug
  validate :acceptable_type
  validates :slug,
    format: {
      with: /\A[a-z0-9\-]+\z/,
      message: "Only alphanumeric characters connected by hyphens are allowed."
    }
  validates_with DashboardJSONValidator

  scope :alphabetical, -> { order("lower(name)") }
  scope :cloneable, -> { where("dashboard_json is not null").select :id, :name }
  scope :unassigned, -> { where("directory_id is null") }
  scope :standalone, -> { where(dashboard_type: "standalone") }
  scope :template, -> { where(dashboard_type: "template") }

  def self.new_with_slug(params)
    dashboard = new(params)
    dashboard.create_slug
    dashboard
  end

  def self.new_permalink(params)
    params[:name] = "#{params[:name]} #{Time.now.utc.to_s}"
    d = new_with_slug(params)
    d.permalink = true
    d
  end

  def make_clone
    clone = dup
    clone.name = "#{name} clone"
    clone
  end

  def acceptable_slug
    if black_listed_slug_names.include? slug
      errors.add(:slug, "Reserved name")
    end
  end

  def acceptable_type
    unless ["standalone", "template"].include? dashboard_type
      errors.add(:dashboard_type, "Invalid dashboard type")
    end
  end

  def black_listed_slug_names
    %w(dashboard servers about help signin signout home contact assets w annotations profiles)
  end

  def widgets
    return [] unless dashboard_json
    JSON.parse(dashboard_json)['widgets']
  end

  def create_slug
    self.slug = SlugMaker.slug(name)
  end

  def template_variables
    JSON.parse(dashboard_json)['globalConfig']['vars'] || {}
  end
end
