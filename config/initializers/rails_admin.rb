RailsAdmin.config do |config|
  config.asset_source = :sprockets

  ### Popular gems integration

  ## == Devise ==
  # Force every /admin request through Warden. Anonymous visitors are sent to
  # the Devise sign-in page instead of seeing the dashboard.
  config.authenticate_with do
    warden.authenticate! scope: :user
  end
  config.current_user_method(&:current_user)

  ## == Cancan ==
  # AdminAbility grants no rights to non-admins, so even an authenticated
  # non-admin who reaches /admin is denied at the authorization layer.
  config.authorize_with :cancancan, AdminAbility
   
  ## RailsAdmin is inheriting from ApplicationController
   config.parent_controller = 'ApplicationController'

  ## == Pundit ==
  # config.authorize_with :pundit

  ## == PaperTrail ==
  # config.audit_with :paper_trail, 'User', 'PaperTrail::Version' # PaperTrail >= 3.0.0

  ### More at https://github.com/sferik/rails_admin/wiki/Base-configuration

  ## == Gravatar integration ==
  ## To disable Gravatar integration in Navigation Bar set to false
  # config.show_gravatar = true

  config.actions do
    dashboard                     # mandatory
    index                         # mandatory
    new
    export
    bulk_delete
    show
    edit
    delete
    show_in_app

    ## With an audit adapter, you can add:
    # history_index
    # history_show
  end
end
