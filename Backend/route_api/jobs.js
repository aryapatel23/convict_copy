const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

let db, jobs;

// Function to initialize the jobs collection
function initializeDatabase(clientDb) {
    db = clientDb;
    jobs = db.collection("jobs");
}

// GET: List all jobs
router.get('/', async (req, res) => {
    try {
        const allJobs = await jobs.find().toArray();
        res.status(200).json(allJobs);
    } catch (err) {
        res.status(500).send("Error fetching jobs: " + err.message);
    }
});

// GET: Search for jobs by name
router.get('/:name', async (req, res) => {
    try {
        const job_Title = req.params.name;

        const jobsList = await jobs
            .find({ "Job_Title": new RegExp(job_Title, 'i') }) // Case-insensitive search
            .toArray(); // Convert cursor to an array

        if (jobsList.length === 0) {
            return res.status(404).json({ error: "No jobs found" });
        }

        res.status(200).json(jobsList);
    } catch (err) {
        res.status(500).json({ error: "Error fetching jobs", details: err.message });
    }
});


// POST: Add a new job
router.post('/', async (req, res) => {
    try {
        const newJob = req.body;
        const result = await jobs.insertOne(newJob);
        res.status(201).json({ message: "Job added", id: result.insertedId });
    } catch (err) {
        res.status(500).send("Error adding job: " + err.message);
    }
});

// PATCH: Partially update a job
router.patch('/:id', async (req, res) => {
    try {
        const jobId = req.params.id;
        const updates = req.body;
        const result = await jobs.updateOne(
            { _id: new ObjectId(jobId) },
            { $set: updates }
        );
        res.status(200).json({ message: "Job updated", modifiedCount: result.modifiedCount });
    } catch (err) {
        res.status(500).send("Error updating job: " + err.message);
    }
});

// DELETE: Remove a job
router.delete('/:id', async (req, res) => {
    try {
        const jobId = req.params.id;
        const result = await jobs.deleteOne({ _id: new ObjectId(jobId) });
        res.status(200).json({ message: "Job deleted", deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).send("Error deleting job: " + err.message);
    }
});

// Export the router and initializeDatabase function
module.exports = { router, initializeDatabase };