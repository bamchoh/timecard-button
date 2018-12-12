Rails.application.routes.draw do
  post '/start' => "web_time_card#start"

  post '/delete_all' => "web_time_card#delete_all"

  post '/delete' => "web_time_card#delete"

  resources :web_time_card

  root 'web_time_card#index'

  get '/index' => "web_time_card#index"

  get '/show' => 'web_time_card#show'

  post '/update' => "web_time_card#update"

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
