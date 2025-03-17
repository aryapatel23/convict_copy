const authenticateJWT = require("./auth");

function isAdmin(req, res, next) {
    authenticateJWT(req, res, () => {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }
        next();
    });
}

module.exports = isAdmin;
