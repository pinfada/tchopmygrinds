# in models/admin_ability.rb
class AdminAbility
  include CanCan::Ability
  def initialize(user)
  	can :read, :all                 # allow everyone to read everything
    return unless user && user.admin?
    can :access, :rails_admin
    can :manage, :all       
  end
    #if user.try(:admin?)
    #  can :manage, :all               # allow superadmins to do anything
    #else
    #  can :read, :all
    #end
end