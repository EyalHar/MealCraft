const mongoose = require('mongoose');

const mealRecipeSchema = new mongoose.Schema({
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  order: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'done'],
    default: 'pending',
  },
  notes: { type: String, default: '' },
});

const mealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    guestCount: { type: Number, required: true, min: 1 },
    style: { type: String, default: '' },
    desiredIngredients: [{ type: String }],
    availableTime: { type: Number },
    maxDifficulty: { type: Number, min: 1, max: 5 },
    freeText: { type: String, default: '' },
    recipes: [mealRecipeSchema],
    status: {
      type: String,
      enum: ['planning', 'shopping', 'cooking', 'done'],
      default: 'planning',
    },
    shoppingList: { type: mongoose.Schema.Types.ObjectId, ref: 'ShoppingList' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meal', mealSchema);
