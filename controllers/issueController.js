const Issue = require('../models/Issue');

// @desc    Get all issues
// @route   GET /api/issues
const getIssues = async (req, res) => {
    try {
        const issues = await Issue.find().sort({ created_at: -1 });
        res.json(issues);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Create a new issue
// @route   POST /api/issues
const createIssue = async (req, res) => {
    try {
        const { title, description, category, location, created_by } = req.body;
        
        // Handle file paths
        // Note: using req.protocol and req.get('host') creates the full URL automatically
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        let files = [];
        if (req.files) {
            files = req.files.map(file => ({
                filename: file.filename,
                path: `${baseUrl}/uploads/${file.filename}`,
                mimetype: file.mimetype
            }));
        }

        const newIssue = new Issue({
            title,
            description,
            category,
            location,
            created_by,
            attachments: files
        });

        const savedIssue = await newIssue.save();
        res.status(201).json(savedIssue);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc    Update issue status
// @route   PATCH /api/issues/:id/status
const updateIssueStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedIssue = await Issue.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        
        if (!updatedIssue) return res.status(404).json({ error: "Issue not found" });
        res.json(updatedIssue);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { getIssues, createIssue, updateIssueStatus };