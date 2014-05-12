require 'migrator'

class ChangeWidgetStackedAttribute < ActiveRecord::Migration
  def up
    Migrator::Widget.call do |widget|
      next unless widget.key?('stacked') && widget['stacked']

      widget['axes'].each do |axis|
        axis['renderer'] = 'stack'
      end
    end
  end

  def down
    # Up is idempotent. Attribute cleanup will happen in a later migration.
  end
end
