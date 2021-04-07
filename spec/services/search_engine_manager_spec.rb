require 'rails_helper'

RSpec.describe SearchEngineManager do

  let(:search_engine_manager) { described_class.new() }

  describe '#initialize' do
    it 'check initialization of search engine manager' do
      expect(described_class.new()).to be_a(SearchEngineManager)
    end
  end

  describe '#search_by_query' do
    it 'empty result array without a query' do
      result = search_engine_manager.search_by_query('')

      expect(result.count).to be(0)
    end
  end
end
