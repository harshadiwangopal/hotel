const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 4000; // Use an available port

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",  // Change if your MySQL username is different
    password: "",  // Change if you set a password
    database: "feedback"
});

db.connect((err) => {
    if (err) {
        console.error("❌ MySQL Connection Failed:", err);
    } else {
        console.log("✅ Connected to MySQL Database!");
    }
});

// Handle Form Submission
app.post("/submit-feedback", (req, res) => {
    const { name, email, rating, comments } = req.body;

    if (!name || !email || !rating || !comments) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = "INSERT INTO feedbacks (name, email, rating, comments) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, rating, comments], (err, result) => {
        if (err) {
            console.error("❌ Error inserting data:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json({ message: "Feedback submitted successfully!" });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
