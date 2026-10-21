const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    aliases: [{ type: String, trim: true }],
    category: {
      type: String,
      enum: ['ירקות ופירות', 'בשר ודגים', 'מוצרי חלב', 'מאפים', 'שימורים', 'תבלינים', 'קפואים', 'כללי'],
      default: 'כללי',
    },
    defaultUnit: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
