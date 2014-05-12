require 'migrator'

describe Migrator do
  describe 'Table' do
    it 'returns a migrator to change all records of an AR like model' do
      record = double(:record, :changed? => true, :save! => true)
      table = double(:table, :all => [record])

      expect(record).to receive(:foo)
      Migrator::Table.call(table) { |o| o.foo }
    end
  end

  describe 'Attribute' do
    it 'returns a migrator to change an object attribute' do
      object = Struct.new(:foo).new(40)
      migrator = Migrator::Attribute.call(:foo) { |o| o + 2 }

      expect { migrator.call(object) }.to change(object, :foo).to(42)
    end
  end

  describe 'Json' do
    it 'returns a migrator to change JSON encoded strings' do
      migrator = Migrator::Json.call { |o| o['foo'] += 1; o }

      expect(migrator.call('{"foo":41}')).to eql('{"foo":42}')
    end
  end
end
