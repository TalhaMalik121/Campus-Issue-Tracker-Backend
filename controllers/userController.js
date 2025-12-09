const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
const getAllUsers = async (req, res) => {
    try {
        // Exclude passwords
        const users = await User.find().select('-password').sort({ created_at: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Toggle block status of a user
// @route   PATCH /api/users/:id/block
const toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Prevent blocking yourself (if you are the admin logged in)
        // req.user is set by the protect middleware
        if (req.user._id.toString() === user._id.toString()) {
            return res.status(400).json({ error: "You cannot block yourself." });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            rollNo: user.rollNo,
            isBlocked: user.isBlocked
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllUsers, toggleBlockUser };
