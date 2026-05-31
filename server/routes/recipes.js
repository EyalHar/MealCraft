const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { upload, cloudinary } = require('../config/cloudinary');

// GET all recipes with optional filters
router.get('/', async (req, res) => {
  try {
    const { style, category, kosherType, difficulty, search, sort } = req.query;
    const filter = {};
    if (style) filter.style = style;
    if (category) filter.category = category;
    if (kosherType) filter.kosherType = kosherType;
    if (difficulty) filter.difficulty = { $lte: Number(difficulty) };
    if (search) filter.$text = { $search: search };

    let sortOpt = { createdAt: -1 };
    if (sort === 'rating') sortOpt = { rating: -1 };
    if (sort === 'timesCooked') sortOpt = { timesCooked: -1 };
    if (sort === 'difficulty') sortOpt = { difficulty: 1 };

    const recipes = await Recipe.find(filter).sort(sortOpt);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single recipe
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create recipe
router.post('/', async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    const saved = await recipe.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update recipe
router.put('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE recipe
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    // Delete images from Cloudinary
    for (const img of recipe.images) {
      if (img.publicId) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }

    await recipe.deleteOne();
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload image — user photos only, no AI images
router.post('/:id/images', upload.single('image'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    recipe.images.push({
      url: req.file.path,
      publicId: req.file.filename,
      isUserPhoto: true,
    });
    await recipe.save();
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE image from recipe
router.delete('/:id/images/:publicId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    const publicId = decodeURIComponent(req.params.publicId);
    await cloudinary.uploader.destroy(publicId);
    recipe.images = recipe.images.filter((img) => img.publicId !== publicId);
    await recipe.save();
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH increment timesCooked + add optional note/rating
router.patch('/:id/cooked', async (req, res) => {
  try {
    const { note, rating } = req.body;
    const update = { $inc: { timesCooked: 1 } };
    if (note) update.$set = { notes: note };
    if (rating) {
      const recipe = await Recipe.findById(req.params.id);
      const newCount = recipe.ratingCount + 1;
      const newRating = (recipe.rating * recipe.ratingCount + rating) / newCount;
      update.$set = { ...update.$set, rating: Math.round(newRating * 10) / 10, ratingCount: newCount };
    }
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET search by ingredients for meal planner
router.get('/search/by-ingredients', async (req, res) => {
  try {
    const { ingredients, style, maxDifficulty, maxTime, guestCount } = req.query;
    const ingredientList = ingredients ? ingredients.split(',').map((i) => i.trim()) : [];

    let filter = {};
    if (style) filter.style = style;
    if (maxDifficulty) filter.difficulty = { $lte: Number(maxDifficulty) };
    if (maxTime) filter.$expr = { $lte: [{ $add: ['$prepTime', '$cookTime'] }, Number(maxTime)] };

    const recipes = await Recipe.find(filter);

    // Score each recipe by how many desired ingredients it contains
    const scored = recipes.map((r) => {
      const recipeIngredients = r.ingredients.map((i) => i.name.toLowerCase());
      const matches = ingredientList.filter((ing) =>
        recipeIngredients.some((ri) => ri.includes(ing.toLowerCase()) || ing.toLowerCase().includes(ri))
      );
      return { recipe: r, matchCount: matches.length, matchRatio: ingredientList.length ? matches.length / ingredientList.length : 0 };
    });

    scored.sort((a, b) => b.matchCount - a.matchCount || b.recipe.rating - a.recipe.rating);

    res.json(scored.map((s) => ({ ...s.recipe.toObject(), matchCount: s.matchCount, matchRatio: s.matchRatio })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
