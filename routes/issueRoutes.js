const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // Import our multers settings
const { 
    getIssues, 
    createIssue, 
    updateIssueStatus 
} = require('../controllers/issueController');

// Define Routes
router.get('/', getIssues);
router.post('/', upload.array('attachments'), createIssue); // Add middleware here
router.patch('/:id/status', updateIssueStatus);

module.exports = router;