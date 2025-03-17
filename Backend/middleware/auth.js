const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

function authenticateJWT(req, res, next) {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Extract token (remove "Bearer " part)
    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }

        req.user = decoded; // Store user data in request object
        next(); // Proceed to the next middleware or route
    });
}

module.exports = authenticateJWT;
