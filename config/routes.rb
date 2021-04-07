Rails.application.routes.draw do
  namespace :api do
    match '/search', to: 'search#search_by_query', via: :get
  end
end
