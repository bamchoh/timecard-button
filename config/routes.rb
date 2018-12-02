Rails.application.routes.draw do
  post '/start' => "web_time_card#start"

  resources :web_time_card

  root 'web_time_card#index'

  get '/index' => "web_time_card#index"

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
