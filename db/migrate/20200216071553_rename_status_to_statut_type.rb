class RenameStatusToStatutType < ActiveRecord::Migration[5.2]
  def change
  	rename_column :users, :status, :statut_type
  end
end
