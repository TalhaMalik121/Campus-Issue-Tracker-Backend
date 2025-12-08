// const express = require('express');
// const router = express.Router();
// const upload = require('../middleware/upload'); // Import our multers settings
// const { 
//     getIssues, 
//     createIssue, 
//     updateIssueStatus 
// } = require('../controllers/issueController');

// // Define Routes
// router.get('/', getIssues);
// router.post('/', upload.array('attachments'), createIssue); // Add middleware here
// router.patch('/:id/status', updateIssueStatus);

// module.exports = router;
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // Import our multers settings
// 🔑 NEW IMPORT: Import the authorization middleware
const { protect, admin } = require('../middleware/auth'); 
const { 
    getIssues, 
    createIssue, 
    updateIssueStatus 
} = require('../controllers/issueController');

// Define Routes
// 🔑 Secure GET: Requires any authenticated user
router.get('/', protect, getIssues);
// 🔑 Secure POST: Requires any authenticated user
router.post('/', protect, upload.array('attachments'), createIssue); 
// 🔑 Secure PATCH: Requires authentication AND 'Admin' role
router.patch('/:id/status', protect, admin, updateIssueStatus);

module.exports = router;