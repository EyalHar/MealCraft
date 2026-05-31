const express = require('express');
const router = express.Router();
const ShoppingList = require('../models/ShoppingList');

// GET all shopping lists
router.get('/', async (req, res) => {
  try {
    const lists = await ShoppingList.find().sort({ createdAt: -1 });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single shopping list
router.get('/:id', async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id).populate('meal', 'title date');
    if (!list) return res.status(404).json({ message: 'List not found' });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create standalone shopping list
router.post('/', async (req, res) => {
  try {
    const list = new ShoppingList(req.body);
    const saved = await list.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update shopping list (items, title)
router.put('/:id', async (req, res) => {
  try {
    const list = await ShoppingList.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!list) return res.status(404).json({ message: 'List not found' });
    res.json(list);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE shopping list
router.delete('/:id', async (req, res) => {
  try {
    await ShoppingList.findByIdAndDelete(req.params.id);
    res.json({ message: 'List deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH toggle item checked state
router.patch('/:id/items/:itemId/toggle', async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    const item = list.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.checked = !item.checked;
    await list.save();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add item to list
router.post('/:id/items', async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    list.items.push(req.body);
    await list.save();
    res.json(list);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE item from list
router.delete('/:id/items/:itemId', async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    list.items.pull({ _id: req.params.itemId });
    await list.save();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update single item
router.put('/:id/items/:itemId', async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    const item = list.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    Object.assign(item, req.body);
    await list.save();
    res.json(list);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
