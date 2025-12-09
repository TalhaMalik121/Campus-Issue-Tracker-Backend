// // const express = require('express');
// // const router = express.Router();
// // const upload = require('../middleware/upload'); // Import our multers settings
// // const { 
// //     getIssues, 
// //     createIssue, 
// //     updateIssueStatus 
// // } = require('../controllers/issueController');

// // // Define Routes
// // router.get('/', getIssues);
// // router.post('/', upload.array('attachments'), createIssue); // Add middleware here
// // router.patch('/:id/status', updateIssueStatus);

// // module.exports = router;
// const express = require('express');
// const router = express.Router();
// const upload = require('../middleware/upload'); // Import our multers settings
// // 🔑 NEW IMPORT: Import the authorization middleware
// const { protect, admin } = require('../middleware/auth'); 
// const { 
//     getIssues, 
//     createIssue, 
//     updateIssueStatus 
// } = require('../controllers/issueController');

// // Define Routes
// // 🔑 Secure GET: Requires any authenticated user
// router.get('/', protect, getIssues);
// // 🔑 Secure POST: Requires any authenticated user
// router.post('/', protect, upload.array('attachments'), createIssue); 
// // 🔑 Secure PATCH: Requires authentication AND 'Admin' role
// router.patch('/:id/status', protect, admin, updateIssueStatus);

// module.exports = router;
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
// 🔑 Import userOnly
const { protect, admin, userOnly } = require('../middleware/auth');
const {
    getIssues,
    createIssue,
    updateIssueStatus,
    addComment,
    addReply,
    toggleLike,
    toggleIssueLike
} = require('../controllers/issueController');

// Define Routes
router.get('/', protect, getIssues);

// 🔑 UPDATED: Added userOnly middleware so Admins cannot post
router.post('/', protect, userOnly, upload.array('attachments'), createIssue);

router.patch('/:id/status', protect, admin, updateIssueStatus);

// 🔑 Like Issue Route
router.patch('/:id/like', protect, toggleIssueLike);

// 🔑 Comment Routes
router.post('/:id/comments', protect, addComment);
router.post('/:id/comments/:commentId/replies', protect, addReply);
router.patch('/:id/comments/:commentId/like', protect, toggleLike);

module.exports = router;