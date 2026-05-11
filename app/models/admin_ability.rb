# in models/admin_ability.rb
class AdminAbility
  include CanCan::Ability

  # Authorization rules for the RailsAdmin engine. Non-admins receive no
  # abilities at all; combined with the `authenticate_with` guard in the
  # RailsAdmin initializer, this denies any access to /admin for non-admins.
  def initialize(user)
    return unless user&.admin?

    can :access, :rails_admin
    can :manage, :all
  end
end