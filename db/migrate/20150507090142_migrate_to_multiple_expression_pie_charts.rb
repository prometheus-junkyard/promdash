class MigrateToMultipleExpressionPieCharts < ActiveRecord::Migration
  def self.up
    Dashboard.all.each do |d|
      d.dashboard_json or next

      obj = JSON.parse(d.dashboard_json)
      obj['widgets'].each do |w|
        if w['type'] == 'pie'
          # if legendFormatString is nil, convert to empty string
          legend_str = w.delete('legendFormatString').to_s
          w['legendFormatStrings'] = [{"id"=>1, "name"=>legend_str}]
          expression = w.delete('expression')
          w['expressions'] = [expression]
        end
      end
      json = JSON.generate(obj)
      d.dashboard_json = json
      d.save!
    end
  end

  def self.down
    raise ActiveRecord::IrreversibleMigration, "Can't reverse JSON migration!"
  end
end
