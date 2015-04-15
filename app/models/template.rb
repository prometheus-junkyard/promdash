class Template < Dashboard
  table_name = "dashboards"
  default_scope { where(dashboard_type: "template") }

  has_many :profiles
end
