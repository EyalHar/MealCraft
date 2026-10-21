const Product = require('../models/Product');
const products = require('../data/products');

// Upsert by name so new entries in the data file are added without touching user edits.
const seedProducts = async () => {
  try {
    const ops = products.map((p) => ({
      updateOne: { filter: { name: p.name }, update: { $setOnInsert: p }, upsert: true },
    }));
    const result = await Product.bulkWrite(ops, { ordered: false });
    if (result.upsertedCount) console.log(`Seeded ${result.upsertedCount} products`);
  } catch (err) {
    console.error('Product seed error:', err.message);
  }
};

module.exports = seedProducts;
