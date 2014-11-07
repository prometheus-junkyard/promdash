class UpdateDashboardJsonForApi < ActiveRecord::Migration
  def self.up
    Dashboard.all.each do |d|
      d.dashboard_json or next

      obj = JSON.parse(d.dashboard_json)
      obj['widgets'].each do |w|
        if w['type'] == 'graph'
          w.delete('legendFormatString')
          w.delete('stacked')
        end
      end
      json = JSON.generate(obj)
      json.gsub!('axis_id', 'axisID')
      json.gsub!('server_id', 'serverID')
      json.gsub!('legend_id', 'legendID')
      json.gsub!('encodeEntireUrl', 'encodeEntireURL')
      json.gsub!('keepUrlUpdated', 'keepURLUpdated')
      json.gsub!('legendSetting', 'showLegend')
      d.dashboard_json = json
      d.save!
    end
  end

  def self.down
    raise ActiveRecord::IrreversibleMigration, "Can't reverse API JSON cleanup migration!"
  end
end
