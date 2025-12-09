require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db'); // Import DB logic
const issueRoutes = require('./routes/issueRoutes'); // Import Routes
const authRoutes = require('./routes/authRoutes');
const app = express();
const PORT = process.env.PORT || 3000;


// 1. Connect to Database
connectDB();

// 2. Middleware
app.use(cors());
app.use(express.json());
// Serve the uploads folder statically so frontend can access images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. API Routes
// Any request to /api/issues will be sent to our issueRoutes file
app.use('/api/issues', issueRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/userRoutes')); // 🔑 Register User Routes

// Simple root check
app.get('/', (req, res) => {
    res.send({ activeStatus: true, error: false });
});

// 4. Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});