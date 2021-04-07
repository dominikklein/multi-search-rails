search_engines_config = Rails.application.config_for :search_engines

Rails.application.configure do
  config.search_engines = search_engines_config['search_engines']
end
