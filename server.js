// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Import the Model
const Issue = require('./models/Issue');
const { error } = require('console');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send({activeStatus:true, error:false});})
// --- 1. Middleware ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 2. Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 3. File Storage Config ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- 4. API Routes ---

// GET: Fetch all issues (Sorted by Newest)
app.get('/api/issues', async (req, res) => {
    try {
        const issues = await Issue.find().sort({ created_at: -1 });
        res.json(issues);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Create a new issue
app.post('/api/issues', upload.array('attachments'), async (req, res) => {
    try {
        const { title, description, category, location, created_by } = req.body;
        
        // Prepare file data
        const files = req.files.map(file => ({
            filename: file.filename,
            path: `http://localhost:${PORT}/uploads/${file.filename}`,
            mimetype: file.mimetype
        }));

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
});

// PATCH: Update status
app.patch('/api/issues/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedIssue = await Issue.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true } // Return the updated document
        );
        
        if (!updatedIssue) return res.status(404).json({ error: "Issue not found" });
        res.json(updatedIssue);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});