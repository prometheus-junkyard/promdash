require 'json'

module Migrator
  # A migrator to modify each record of a given ActiveRecord::Base like model.
  Table = ->(model, &block) do
    model.all.each do |record|
      block.call record
      record.save! if record.changed?
    end
  end

  # A filter to modify an object's attribute.
  Attribute = ->(attribute, &block) do
    ->(object) do
      object.send("#{attribute}=", block.call(object.send(attribute)))
    end
  end

  # A filter to modify a JSON object.
  Json = ->(&block) do
    ->(value) do
      if value && !value.empty? && json = JSON.load(value)
        block.call(json)
        JSON.dump(json)
      else
        value
      end
    end
  end

  # A migrator to modify each dashboard widget.
  Widget = ->(&block) do
    Table.call(::Dashboard,
      &Attribute.call(:dashboard_json,
        &Json.call(
          &->(json) { json['widgets'].each(&block) })))
  end
end
