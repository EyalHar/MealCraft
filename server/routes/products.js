const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

const normalize = (s) => s.trim().replace(/׳/g, "'").replace(/״/g, '"').replace(/\s+/g, ' ');
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Hebrew geresh/gershayim may be typed either as the Hebrew mark or as an ASCII quote.
const toPattern = (q) =>
  escapeRegex(q).replace(/'/g, "['׳]").replace(/"/g, '["״]');

const rank = (text, q) => {
  if (text === q) return 0;
  if (text.startsWith(q)) return 1;
  if (text.split(' ').some((w) => w.startsWith(q))) return 2;
  return 3;
};

// GET /api/products?q=עגב&limit=10
router.get('/', async (req, res) => {
  try {
    const q = normalize(req.query.q || '');
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    if (!q) return res.json([]);

    const regex = new RegExp(toPattern(q), 'i');
    const matches = await Product.find({ $or: [{ name: regex }, { aliases: regex }] }).lean();

    const scored = matches.map((p) => {
      const nameRank = rank(normalize(p.name), q);
      const aliasRank = Math.min(4, ...p.aliases.map((a) => rank(normalize(a), q) + 0.5));
      return { ...p, score: Math.min(nameRank, aliasRank) };
    });

    scored.sort((a, b) => a.score - b.score || a.name.length - b.name.length || a.name.localeCompare(b.name, 'he'));
    res.json(scored.slice(0, limit).map(({ score, ...p }) => p));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
