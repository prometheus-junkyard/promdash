class Directory < ActiveRecord::Base
  has_many :dashboards, -> { order "lower(name)" }

  validates :name,
    uniqueness: { case_sensitive: false },
    presence: true

  after_destroy :unassociate_dashboards

  def unassociate_dashboards
    dashboards.update_all(directory_id: nil)
  end
end
