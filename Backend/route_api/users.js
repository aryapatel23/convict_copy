const express = require('express');
const { ObjectId } = require('mongodb');
require('dotenv').config();

const router = express.Router();

let db, users;

function initializeDatabase(dbInstance) {
    db = dbInstance;
    users = db.collection("users");
}

// 🔹 POST: Add a new user
router.post('/', async (req, res) => {
    try {
        console.log("🔹 Received POST request:", req.body); // Debugging log

        const newuser = req.body;

        // Validation: Ensure required fields are present
        if (!newuser.name || !newuser.email || !newuser.password) {
            return res.status(400).json({ error: "Name, Email, and Password are required" });
        }

        const result = await users.insertOne(newuser);
        console.log("✅ User inserted:", result); // Debugging log

        res.status(201).json({ message: "User added", id: result.insertedId });
    } catch (err) {
        console.error("❌ Error adding user:", err.message);
        res.status(500).json({ error: "Error adding user", details: err.message });
    }
});


// 🔹 GET: Fetch all users
router.get('/', async (req, res) => {
    try {
        const userList = await users.find({}).toArray();
        res.status(200).json(userList);
    } catch (err) {
        res.status(500).json({ error: "Error fetching users", details: err.message });
    }
});

module.exports = { router, initializeDatabase };
