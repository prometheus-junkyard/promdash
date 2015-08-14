class SlugMaker
  def self.slug(name)
    name.downcase.strip.gsub(' ','-').gsub(/[^a-zA-Z0-9-]/, '')
  end
end
