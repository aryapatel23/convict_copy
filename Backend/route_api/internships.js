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

router.get('/:name', async (req, res) => {
    try {
        const job_title = req.params.name;

        const jobsList = await jobs
            .find({ "job_title": new RegExp(job_title, 'i') }) // Case-insensitive search
            .toArray(); // Convert cursor to an array

        if (jobsList.length === 0) {
            return res.status(404).json({ error: "No jobs found" });
        }

        res.status(200).json(jobsList);
    } catch (err) {
        res.status(500).json({ error: "Error fetching jobs", details: err.message });
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
router.patch("/:name", async (req, res) => {
    try {
        if (!internships) {
            return res.status(500).json({ error: "Database not initialized" });
        }

        const jobTitle = decodeURIComponent(req.params.name).trim();
        const updates = req.body;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No update fields provided" });
        }

        const result = await internships.updateOne(
            { job_title: { $regex: new RegExp("^" + jobTitle + "$", "i") } }, // Case-insensitive match
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Internship not found" });
        }

        res.status(200).json({
            message: "Internship updated successfully",
            modifiedCount: result.modifiedCount,
        });
    } catch (err) {
        console.error("Error updating internship:", err.message);
        res.status(500).json({ error: "Error updating internship", details: err.message });
    }
});


// 🔹 DELETE: Remove an internship by job_title
router.delete("/:name", async (req, res) => {
    try {
        if (!internships) {
            return res.status(500).json({ error: "Database not initialized" });
        }

        const jobTitle = decodeURIComponent(req.params.name).trim();

        const result = await internships.deleteOne({
            job_title: { $regex: new RegExp("^" + jobTitle + "$", "i") } // Case-insensitive match
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Internship not found" });
        }

        res.status(200).json({ message: "Internship deleted successfully" });
    } catch (err) {
        console.error("Error deleting internship:", err.message);
        res.status(500).json({ error: "Error deleting internship", details: err.message });
    }
});

// Export the router and initializeDatabase function
module.exports = { router, initializeDatabase };