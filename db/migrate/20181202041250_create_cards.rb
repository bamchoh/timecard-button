class CreateCards < ActiveRecord::Migration[5.2]
  def change
    create_table :cards do |t|
      t.string :status
      t.datetime :datetime

      t.timestamps
    end
  end
end
