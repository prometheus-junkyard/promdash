require "spec_helper"

describe ShortenedUrl do
  describe ".create_from_encoded_url" do
    it "does not set last accessed on creation" do
      shortened_url = ShortenedUrl.create_from_encoded_url("some_encoded_url")
      expect(shortened_url.last_accessed).to be_nil
    end

    it "persists in the database" do
      expect {
        ShortenedUrl.create_from_encoded_url("some_encoded_url")
      }.to change { ShortenedUrl.count }.by 1
    end

    it "does not create duplicates" do
      expect {
        3.times { ShortenedUrl.create_from_encoded_url("url") }
      }.to change { ShortenedUrl.count }.by 1
    end
  end
end
