class AddUidToCards < ActiveRecord::Migration[5.2]
  def change
    add_column :cards, :uid, :string
  end
end
