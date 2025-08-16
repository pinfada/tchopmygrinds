Rails.application.routes.draw do
  # API namespace pour React
  namespace :api do
    namespace :v1 do
      # CORS preflight pour API seulement
      match '*all', to: 'base#cors_preflight_check', via: [:options]
      # Authentification
      post 'auth/login', to: 'auth#login'
      post 'auth/register', to: 'auth#register'
      post 'auth/logout', to: 'auth#logout'
      get 'auth/me', to: 'auth#me'
      patch 'auth/profile', to: 'auth#update_profile'
      
      # Commerces
      resources :commerces do
        collection do
          get :nearby
          get :search
        end
        member do
          get :products
        end
      end
      
      # Produits
      resources :products do
        collection do
          get :search
          get :categories
        end
        member do
          get :price_history
        end
      end
      
      # Commandes
      resources :orders do
        collection do
          get :stats
        end
        member do
          patch :cancel
        end
      end
      
      # Manifestations d'intérêt
      resources :product_interests do
        collection do
          get :for_merchant
        end
        member do
          post :notify_availability
        end
      end
      
      # Évaluations et avis
      resources :ratings do
        collection do
          get :my_ratings
        end
        member do
          post :mark_helpful
        end
      end
      
      # Administration
      namespace :admin do
        resources :ratings do
          collection do
            get :stats
          end
          member do
            patch :approve
            patch :reject
          end
        end
      end
      
      # Utilitaires
      namespace :utils do
        get 'geocode', to: 'utils#geocode'
        get 'reverse-geocode', to: 'utils#reverse_geocode'
      end
    end
  end
  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  
  # Handle Chrome DevTools requests (ignore silently)
  get '/.well-known/*path', to: proc { |env| [204, {}, ['']] }
  
  # Serve React app for all main routes
  root "pages#react_app"
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
    
    # React app routes (SPA)
    get '/map', to: 'pages#react_app'
    get '/commerces', to: 'pages#react_app'
    get '/products', to: 'pages#react_app'
    get '/cart', to: 'pages#react_app'
    get '/checkout', to: 'pages#react_app'
    get '/orders', to: 'pages#react_app'
    get '/interests', to: 'pages#react_app'
    get '/profile', to: 'pages#react_app'
    get '/auth', to: 'pages#react_app'
    
    # Legacy routes still needed for APIs
    match '/serveraddress', to: 'pages#serveraddress', via: 'get'
    match '/agrimer', to: 'pages#agrimer', via: 'get'
  
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
