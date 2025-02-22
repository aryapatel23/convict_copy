const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

let internships;

// Function to initialize the internships collection
function initializeDatabase(db) {
    internships = db.collection("internships");
}

// 🔹 GET all internships
router.get('/', async (req, res) => {
    try {
        const allInternships = await internships.find().toArray();
        res.status(200).json(allInternships);
    } catch (err) {
        res.status(500).json({ error: "Error fetching internships", details: err.message });
    }
});

// 🔹 GET internships by job title (search)
router.get('/:name', async (req, res) => {
    try {
        const job_title = req.params.name;

        const internshipsList = await internships
            .find({ job_title: new RegExp(job_title, 'i') })  // Case-insensitive search
            .toArray(); // Convert cursor to an array

        res.status(200).json(internshipsList);
    } catch (err) {
        console.error("Error fetching internships:", err);
        res.status(500).json({ error: "Error fetching internships", details: err.message });
    }
});


// 🔹 POST: Create new internship
router.post('/', async (req, res) => {
    try {
        const newInternship = req.body;
        const result = await internships.insertOne(newInternship);
        res.status(201).json({ message: "Internship added", id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: "Error adding internship", details: err.message });
    }
});

// 🔹 PATCH: Partially update an internship
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const result = await internships.updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Internship not found or no changes made" });
        }

        res.status(200).json({ message: "Internship updated", modifiedCount: result.modifiedCount });
    } catch (err) {
        res.status(500).json({ error: "Error updating internship", details: err.message });
    }
});

// 🔹 DELETE: Remove an internship
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const result = await internships.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Internship not found" });
        }

        res.status(200).json({ message: "Internship deleted" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting internship", details: err.message });
    }
});

// Export the router and initializeDatabase function
module.exports = { router, initializeDatabase };