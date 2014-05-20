class ConvertToMultipleLegendStrings < ActiveRecord::Migration
  def up
    Dashboard.all.each do |d|
      next if d.dashboard_json == "null" or d.dashboard_json.nil?
      json = JSON.parse(d.dashboard_json)
      widgets = json['widgets']
      widgets.compact!
      widgets.each do |w|
        next if w['type'] != 'graph'
        legend_string = w['legendFormatString']
        w['legendFormatStrings'] = [
          {"id" => 1, "name"=> legend_string || ""}
        ]
        w['expressions'].each_with_index do |exp, i|
          exp['legend_id'] = 1 if legend_string
          exp['id'] = i
        end
      end
      d.update_attribute(:dashboard_json, json.to_json)
    end
  end

  def down
    # there is no going back.
  end
end
