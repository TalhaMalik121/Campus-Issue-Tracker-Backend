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


// @desc    Add a comment to an issue
// @route   POST /api/issues/:id/comments
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) return res.status(404).json({ error: "Issue not found" });

        // Safety Initialization
        if (!issue.comments) issue.comments = [];

        const newComment = {
            text,
            user: {
                name: req.user.name,
                id: req.user._id,
                role: req.user.role
            },
            likes: [],
            replies: []
        };

        issue.comments.push(newComment);
        await issue.save();
        res.json(issue);
    } catch (err) {
        console.error("Error in addComment:", err);
        res.status(500).json({ error: err.message });
    }
};

// @desc    Reply to a comment
// @route   POST /api/issues/:id/comments/:commentId/replies
const addReply = async (req, res) => {
    try {
        const { text } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) return res.status(404).json({ error: "Issue not found" });

        // Safety check just in case
        if (!issue.comments) issue.comments = [];

        const comment = issue.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        if (!comment.replies) comment.replies = [];

        const newReply = {
            text,
            user: {
                name: req.user.name,
                id: req.user._id,
                role: req.user.role
            }
        };

        comment.replies.push(newReply);
        await issue.save();
        res.json(issue);
    } catch (err) {
        console.error("Error in addReply:", err);
        res.status(500).json({ error: err.message });
    }
};

// @desc    Toggle like on a comment
// @route   PATCH /api/issues/:id/comments/:commentId/like
const toggleLike = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ error: "Issue not found" });

        if (!issue.comments) issue.comments = [];

        const comment = issue.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const userId = req.user._id.toString();

        if (!comment.likes) comment.likes = [];
        const index = comment.likes.indexOf(userId);

        if (index === -1) {
            comment.likes.push(userId); // Like
        } else {
            comment.likes.splice(index, 1); // Unlike
        }

        await issue.save();
        res.json(issue);
    } catch (err) {
        console.error("Error in toggleLike (Comment):", err);
        res.status(500).json({ error: err.message });
    }
};

// @desc    Toggle like on the ISSUE itself
// @route   PATCH /api/issues/:id/like
const toggleIssueLike = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ error: "Issue not found" });

        const userId = req.user._id.toString();

        // Ensure likes array exists (for legacy documents)
        if (!issue.likes) issue.likes = [];

        const index = issue.likes.indexOf(userId);

        if (index === -1) {
            issue.likes.push(userId); // Like
        } else {
            issue.likes.splice(index, 1); // Unlike
        }

        await issue.save();
        res.json(issue);
    } catch (err) {
        console.error("Error in toggleIssueLike:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getIssues,
    createIssue,
    updateIssueStatus,
    addComment,
    addReply,
    toggleLike,
    toggleIssueLike
};