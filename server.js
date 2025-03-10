const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hotelqr'
});

db.connect(err => {
    if (err) throw err;
    console.log('✅ MySQL Connected...');
});

const SECRET_KEY = "your_secret_key";

// **Signup Route**
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length > 0) return res.status(400).json({ message: 'Email already exists' });

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ message: 'Error hashing password' });

            db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ message: 'Error creating user', error: err });

                res.status(201).json({ message: 'User registered successfully' });
            });
        });
    });
});

// **Login Route**
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length === 0) return res.status(401).json({ message: 'User not found' });

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error verifying password' });
            if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

            const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

            res.json({ message: 'Login successful', token });
        });
    });
});

app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
});
