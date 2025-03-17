// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const internshipsModule = require('./route_api/internships');
const jobsModule = require('./route_api/jobs');
const contactusModule = require('./route_api/contactus');
const usersModule = require("./route_api/users");

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

async function initializeDatabase() {
    try {
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(dbName);

        // Initialize collections and modules
        internshipsModule.initializeDatabase(db);
        jobsModule.initializeDatabase(db);
        contactusModule.initializeDatabase(db);
        usersModule.initializeDatabase(db);

        // Use the routes
        app.use('/internships', internshipsModule.router);
        app.use('/jobs', jobsModule.router);
        app.use('/contactus', contactusModule.router);
        app.use("/users", usersModule.router);

        // Start the server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

initializeDatabase();
