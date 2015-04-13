# The exception to be raised when a server specified by URL in the
# dashboard_json cannot be found in the database.
class ServerNotFoundError < Exception
end

module ServerTransformer
  # Iterate through all incoming widgets and transform any servers specified by
  # their URL into servers specified by their ID.
  def self.transform(dashboard_json)
    dashboard_json['widgets'].each do |w|
      case w['type']
      when 'graph',' pie'
        w['expressions'].each do |e|
          transform_server(e)
        end
      end
    end
  end

  private

  def self.transform_server(obj)
    if url = obj['serverURL']
      server = Server.find_by_url(url)
      unless server
        raise ServerNotFoundError, "No server with URL #{obj['serverURL']}"
      end
      obj['serverID'] = server.id
      obj.delete('serverURL')
    end
  end
end
