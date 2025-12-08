const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as necessary

// 1. Middleware to verify JWT and attach user data (protects all required routes)
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format: "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user (including their role) and attach to request object
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ error: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            res.status(401).json({ error: 'Not authorized, token failed or expired' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

// 2. Middleware to check if the user is an Admin
const admin = (req, res, next) => {
    // This must run AFTER 'protect' middleware has attached req.user
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ 
            error: 'Not authorized. Only administrators can update issue status.' 
        });
    }
};

module.exports = { protect, admin };