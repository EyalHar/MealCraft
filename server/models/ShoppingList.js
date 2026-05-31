const mongoose = require('mongoose');

const shoppingItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  amount: { type: String, default: '' },
  unit: { type: String, default: '' },
  category: { type: String, default: 'כללי' },
  checked: { type: Boolean, default: false },
  fromRecipe: { type: String, default: '' },
});

const shoppingListSchema = new mongoose.Schema(
  {
    meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
    title: { type: String, required: true, trim: true },
    items: [shoppingItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShoppingList', shoppingListSchema);
