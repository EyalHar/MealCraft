const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: String, required: true },
  unit: { type: String, default: '' },
});

const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    style: {
      type: String,
      enum: ['אשכנזי', 'ספרדי', 'מזרחי', 'ים תיכוני', 'אסייתי', 'אמריקאי', 'מודרני', 'אחר'],
      default: 'אחר',
    },
    category: {
      type: String,
      enum: ['מנה ראשונה', 'מרק', 'סלט', 'מנה עיקרית', 'תוספת', 'קינוח', 'מאפה', 'שתייה'],
      required: true,
    },
    kosherType: {
      type: String,
      enum: ['בשרי', 'חלבי', 'פרווה'],
      required: true,
    },
    ingredients: [ingredientSchema],
    instructions: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 5, required: true },
    prepTime: { type: Number, required: true },
    cookTime: { type: Number, default: 0 },
    servings: { type: Number, required: true },
    tools: [{ type: String }],
    images: [
      {
        url: { type: String },
        publicId: { type: String },
        isUserPhoto: { type: Boolean, default: true },
      },
    ],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    timesCooked: { type: Number, default: 0 },
    tags: [{ type: String }],
    source: { type: String, enum: ['user', 'ai'], default: 'user' },
    aiSuggestionData: { type: Object, default: null },
  },
  { timestamps: true }
);

recipeSchema.index({ name: 'text', tags: 'text', 'ingredients.name': 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
