const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const ShoppingList = require('../models/ShoppingList');
const Recipe = require('../models/Recipe');

// GET all meals
router.get('/', async (req, res) => {
  try {
    const meals = await Meal.find().populate('recipes.recipe').sort({ createdAt: -1 });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single meal
router.get('/:id', async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('recipes.recipe').populate('shoppingList');
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json(meal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create meal
router.post('/', async (req, res) => {
  try {
    const meal = new Meal(req.body);
    const saved = await meal.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update meal
router.put('/:id', async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('recipes.recipe');
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json(meal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE meal
router.delete('/:id', async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    if (meal.shoppingList) await ShoppingList.findByIdAndDelete(meal.shoppingList);
    res.json({ message: 'Meal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST generate shopping list from meal
router.post('/:id/shopping-list', async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('recipes.recipe');
    if (!meal) return res.status(404).json({ message: 'Meal not found' });

    const scalingFactor = meal.guestCount;
    const itemsMap = {};

    for (const mr of meal.recipes) {
      const recipe = mr.recipe;
      if (!recipe) continue;
      const servingsRatio = scalingFactor / recipe.servings;

      for (const ing of recipe.ingredients) {
        const key = `${ing.name}_${ing.unit}`;
        const scaledAmount = parseFloat(ing.amount) * servingsRatio;
        if (itemsMap[key]) {
          itemsMap[key].amount = String(
            Math.round((parseFloat(itemsMap[key].amount) + scaledAmount) * 10) / 10
          );
        } else {
          itemsMap[key] = {
            name: ing.name,
            amount: String(Math.round(scaledAmount * 10) / 10),
            unit: ing.unit,
            fromRecipe: recipe.name,
            checked: false,
            category: 'כללי',
          };
        }
      }
    }

    const existing = meal.shoppingList
      ? await ShoppingList.findById(meal.shoppingList)
      : null;

    if (existing) {
      existing.items = Object.values(itemsMap);
      await existing.save();
      res.json(existing);
    } else {
      const list = new ShoppingList({
        meal: meal._id,
        title: `קניות לארוחה: ${meal.title}`,
        items: Object.values(itemsMap),
      });
      const saved = await list.save();
      meal.shoppingList = saved._id;
      await meal.save();
      res.status(201).json(saved);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update recipe status within meal (preparation tracking)
router.patch('/:id/recipes/:recipeId/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: 'Meal not found' });

    const mealRecipe = meal.recipes.id(req.params.recipeId);
    if (!mealRecipe) return res.status(404).json({ message: 'Recipe not in meal' });

    mealRecipe.status = status;
    if (notes !== undefined) mealRecipe.notes = notes;

    // When done, increment timesCooked on the actual recipe
    if (status === 'done') {
      await Recipe.findByIdAndUpdate(mealRecipe.recipe, { $inc: { timesCooked: 1 } });
    }

    await meal.save();
    const updated = await Meal.findById(meal._id).populate('recipes.recipe');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
