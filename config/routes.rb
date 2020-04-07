StatExo1::Application.routes.draw do
  
  get 'users/index'
  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  devise_for :users, controllers: { 
  #  sessions: 'users/sessions',
    registrations: 'registrations'
  }
  
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
    end
  end

  resources :addresses
  resources :orders
  resources :orderdetails


  root "pages#home"

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
