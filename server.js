const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const db = require('./config/db');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});



const PORT = process.env.PORT || 3306;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));



// New Route for Admin Dashboard


