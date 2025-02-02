const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const router = express.Router();
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

let db, contactus;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        contactus = db.collection("contactus");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit process if DB connection fails
    }
}

// Initialize Database
initializeDatabase();

// Routes

// 🔹 POST: Add a new Contact Inquiry
router.post('/', async (req, res) => {
    try {
        const newContact = req.body;

        // Validation: Ensure required fields are present
        if (!newContact.name || !newContact.email || !newContact.message) {
            return res.status(400).json({ error: "Name, Email, and Message are required" });
        }

        const result = await contactus.insertOne(newContact);
        res.status(201).json({ message: "Contact added", id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: "Error adding contact", details: err.message });
    }
});

// 🔹 GET: Fetch all contact inquiries
router.get('/', async (req, res) => {
    try {
        const contacts = await contactus.find({}).toArray();
        res.status(200).json(contacts);
    } catch (err) {
        res.status(500).json({ error: "Error fetching contacts", details: err.message });
    }
});

// Export the router
module.exports = { router, initializeDatabase };