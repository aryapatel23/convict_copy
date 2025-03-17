const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateJWT = require("../middleware/auth"); // Import middleware
const isAdmin = require("../middleware/admin");

const router = express.Router();
let usersCollection; // Will be initialized later

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// **Initialize Database Connection**
function initializeDatabase(db) {
    usersCollection = db.collection("users");
}

// **User Registration**
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Default role to "user" if not provided
        const userRole = role === "admin" ? "admin" : "user";

        // Save user
        await usersCollection.insertOne({ username, email, password: hashedPassword, role: userRole });

        res.status(201).json({ message: "User registered successfully", role: userRole });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// **User Login**
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find user
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token with role
        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role }, 
            JWT_SECRET, 
            { expiresIn: "60d" }
        );

        res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// **Protected Route Example**
router.get("/protected", authenticateJWT, (req, res) => {
    res.json({ message: "Access granted", user: req.user });
});



router.get("/admin-dashboard", isAdmin, (req, res) => {
    res.json({ message: "Welcome, Admin!", adminData: req.user });
});

// Export Module
module.exports = { initializeDatabase, router };
