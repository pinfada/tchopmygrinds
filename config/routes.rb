Rails.application.routes.draw do
  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  
  # Handle Chrome DevTools requests (ignore silently)
  get '/.well-known/*path', to: proc { |env| [204, {}, ['']] }
  
  root "pages#home"
  get 'users/index'
  devise_for :users, controllers: { 
    #  sessions: 'users/sessions',
      registrations: 'registrations'
    }
  
    if Rails.env.development?
      mount LetterOpenerWeb::Engine, at: "/letter_opener"
    end
    #resources :commerces do
    #  collection do
    #    get :search
    #  end
    #end
    
    match '/home', to: 'pages#home', via: 'get'
    match '/contact', to: 'pages#contact', via: 'get'
    match '/propos', to: 'pages#propos', via: 'get'
    match '/aide', to: 'pages#aide', via: 'get'
    match '/agrimer', to: 'pages#agrimer', via: 'get'
    match '/fail', to: 'pages#fail', via: 'get'
    match '/serveraddress', to: 'pages#serveraddress', via: 'get'
    match '/test-tailwind', to: 'pages#test_tailwind', via: 'get'
  
    resources :newsletters
  
    concern :productable do
      resources :products
    end
    
    concern :ordertable do
      resources :orderdetails
    end
    
    concern :categorizable do
      resources :categorizations
    end
    
    resources :commerces, concerns: [:productable, :categorizable] do
      collection do
        get :search
        get :listcommerce
      end
    end
    
    resources :users do
      resources :orders, concerns: [:productable, :ordertable]
      resources :commerces, concerns: [:productable, :categorizable] 
      resources :addresses
    end
    
    resources :products, concerns: [:categorizable] do
      resources :orders, concerns: [:ordertable]
      collection do
        get :listproduct
        get :listcommerce
        get :search_nearby  # Nouvelle route pour recherche avancée
      end
    end
  
    resources :addresses
    resources :orders
    resources :orderdetails
    
    resources :product_interests, only: [:create, :index, :destroy] do
      collection do
        get :for_merchants
      end
    end
end
