class Ability
  include CanCan::Ability

  # Authorization rules consumed by the legacy (non-API) controllers via
  # CanCan's `authorize_resource`. The API v1 controllers do not use CanCan,
  # they scope every query through `current_user.<association>`.
  #
  # SCOPE RULES: every non-admin grant carries a condition hash that restricts
  # the rule to records the current user owns. Without the hash, CanCan would
  # let any seller manage any other seller's resources.
  def initialize(user)
    return if user.nil? # guests have no abilities

    if user.admin?
      can :manage, :all
      return
    end

    # Everyone authenticated can read public catalog data.
    can :read, Commerce
    can :read, Product

    if user.seller_role
      # A seller can manage commerces they own, and products belonging to those commerces.
      can :manage, Commerce, user_id: user.id
      can :manage, Product, commerce: { user_id: user.id }
    end

    # Both roles own their personal records.
    can :manage, Address, user_id: user.id
    can :manage, Order,   user_id: user.id
    can :manage, ProductInterest, user_id: user.id
  end
end
