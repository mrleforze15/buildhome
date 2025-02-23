const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();
const dotenv = require('dotenv');


dotenv.config();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [results] = await db.promise().execute(
            'SELECT * FROM alumni WHERE email = ?', [email]
        );

        if (results.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = results[0];

        // 🔍 Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 🔑 Generate JWT Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token, user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});


router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.promise().execute(
            'INSERT INTO alumni (name, email, password, role, is_verified) VALUES (?, ?, ?, "alumni", 0)',
            [name, email, hashedPassword]
        );
        res.status(201).json({ message: 'Registration successful. Pending admin approval.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Alumni Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.promise().execute(
            'SELECT * FROM alumni WHERE email = ?', [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'User not found. Please register.' });
        }

        const user = users[0];

        // Check if alumni is verified
        if (!user.is_verified) {
            return res.status(403).json({ message: 'Your account is pending admin approval.' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;
