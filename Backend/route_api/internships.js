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
router.get('/search/:name', async (req, res) => {
    try {
        const internshipTitle = req.params.name;
        const internshipsList = await internships
            .find({ internship_title: new RegExp(internshipTitle, 'i') }) // Case-insensitive search
            .toArray();

        res.status(200).json(internshipsList);
    } catch (err) {
        console.error("Error fetching internships:", err);
        res.status(500).json({ error: "Error fetching internships", details: err.message });
    }
});


// 🔹 GET internship by ID
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }
        const internship = await internships.findOne({ _id: new ObjectId(id) });
        if (!internship) {
            return res.status(404).json({ error: "Internship not found" });
        }
        res.status(200).json(internship);
    } catch (error) {
        console.error("Error fetching internship:", error);
        res.status(500).json({ error: "Internal server error" });
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

// 🔹 PATCH: Update an internship by job_title
router.patch("/update/:name", async (req, res) => {
    try {
        const internshipTitle = decodeURIComponent(req.params.name).trim(); // Decode and clean input
        const updates = req.body;

        // Validate if request body has update fields
        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No update fields provided" });
        }

        // Update the correct field in MongoDB
        const result = await internships.updateOne(
            { internship_title: { $regex: new RegExp("^" + internshipTitle + "$", "i") } }, // Case-insensitive match
            { $set: updates }
        );

        // Check if the document was found and updated
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Internship not found" });
        }

        res.status(200).json({ message: "Internship updated successfully" });
    } catch (err) {
        console.error("Error updating internship:", err);
        res.status(500).json({ error: "Error updating internship", details: err.message });
    }
});


// 🔹 DELETE: Remove an internship by job_title
router.delete("/delete/:name", async (req, res) => {
    try {
        const jobTitle = decodeURIComponent(req.params.name).trim();
        const result = await internships.deleteOne({
            job_title: { $regex: new RegExp("^" + jobTitle + "$", "i") }
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Internship not found" });
        }
        res.status(200).json({ message: "Internship deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting internship", details: err.message });
    }
});

// Export the router and initializeDatabase function
module.exports = { router, initializeDatabase };
