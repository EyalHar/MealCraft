require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedProducts = require('./config/seedProducts');

const app = express();

connectDB().then(seedProducts);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/shopping', require('./routes/shopping'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/products', require('./routes/products'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
