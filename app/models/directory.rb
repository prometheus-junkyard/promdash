class Directory < ActiveRecord::Base
  has_many :dashboards, -> { order('lower(name)') }

  scope :sorted, -> { order('lower(name)') }

  validates :name,
    uniqueness: { case_sensitive: false },
    presence: true

  after_destroy :unassociate_dashboards

  def unassociate_dashboards
    dashboards.update_all(directory_id: nil)
  end

  def anchor_name
    name.gsub(/\W+/, '-').gsub(/^-+|-+$/, '').downcase
  end
end
