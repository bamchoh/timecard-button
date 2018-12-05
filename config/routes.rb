Rails.application.routes.draw do
  post '/start' => "web_time_card#start"

  post '/delete' => "web_time_card#delete"

  resources :web_time_card

  root 'web_time_card#index'

  get '/index' => "web_time_card#index"

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
