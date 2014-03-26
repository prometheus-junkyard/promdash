class SlugMaker
  def self.slug(name)
    name.downcase.gsub(' ','-').gsub(/[^a-zA-Z0-9-]/, '')
  end
end
