const express = require('express');
const router = express.Router();
const { getAllUsers, toggleBlockUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// All routes here are protected and strictly for Admins
router.use(protect);
router.use(admin);

router.get('/', getAllUsers);
router.patch('/:id/block', toggleBlockUser);

module.exports = router;
