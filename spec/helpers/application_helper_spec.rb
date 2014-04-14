require 'spec_helper'

describe ApplicationHelper do
  describe '#page_title' do
    context 'given no input' do
      it 'returns a default title' do
        expect(helper.page_title).to be_a(String)
      end

      it 'includes a set content variable title' do
        helper.content_for(:title, 'dashboards')

        expect(helper.page_title).to match('dashboards')
      end
    end

    context 'given a string' do
      it 'returns the given value' do
        expect(helper.page_title('title')).to eql('title')
      end

      it 'sets the title content variable' do
        helper.page_title('page')

        expect(helper.content_for(:title)).to eql('page')
      end
    end

    context 'given any other input' do
      it 'raises an ArgumentError' do
        expect { helper.page_title([]) }.to raise_error(ArgumentError)
      end
    end
  end
end
