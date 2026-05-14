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

  # Currency uses `code` as its primary key (ISO-4217 string, not an integer).
  # Without this block RailsAdmin still auto-discovers it, but the field order,
  # labels and help text below make the form usable without reading docs.
  config.model 'Currency' do
    navigation_label 'Configuration'
    navigation_icon 'fas fa-coins'
    label 'Devise'
    label_plural 'Devises'

    list do
      field :code do
        column_width 80
      end
      field :label
      field :suffix do
        column_width 80
      end
      field :decimals do
        column_width 80
      end
      field :updated_at
    end

    edit do
      field :code do
        # Currency.code is the natural primary key — commerces.currency
        # references it as a plain string with no FK constraint, so renaming
        # would silently break every shop using the old code. Lock the field
        # after creation.
        read_only do
          !bindings[:object].new_record?
        end
        help 'Code ISO-4217 sur 3 lettres majuscules (ex : EUR, XAF, ETB, NGN, USD). Non modifiable après création.'
      end
      field :label do
        help 'Libellé affiché dans le menu déroulant marchand. Préfixer du symbole aide la lisibilité (ex : « € Euro (zone euro) »).'
      end
      field :decimals do
        help '2 pour la plupart des devises, 0 pour celles sans unité fractionnaire (XAF, JPY).'
      end
      field :suffix do
        help 'Suffixe ajouté après le montant formaté (ex : €, FCFA, Br, ₦).'
      end
    end
  end
end
