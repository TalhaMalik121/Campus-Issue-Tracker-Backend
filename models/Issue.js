const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  // 🔑 ENFORCED CATEGORIES
  category: {
    type: String,
    enum: ['Infrastructure', 'IT/Wi-Fi', 'Electrical', 'Cleanliness', 'Academic', 'Other', 'General'], // Added General for legacy support
    default: 'Infrastructure'
  },

  location: { type: String, required: true },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Resolved', 'Archived'], // Added Archived
    default: 'New'
  },
  // 🔑 NEW: Track who liked the issue
  likes: {
    type: [{ type: String }],
    default: []
  },

  created_by: { type: String, default: 'Anonymous' },
  // We store an array of file objects
  attachments: [
    {
      filename: String,
      path: String,
      mimetype: String
    }
  ],
  // 🔑 NEW: Comment System
  comments: {
    type: [
      {
        text: { type: String, required: true },
        user: {
          name: String,
          id: String, // Store generic ID string to be flexible
          role: String
        },
        likes: [String], // Array of User IDs who liked
        replies: [
          {
            text: String,
            user: { name: String, id: String, role: String },
            createdAt: { type: Date, default: Date.now }
          }
        ],
        createdAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  created_at: { type: Date, default: Date.now }
});

// This helps frontend use 'id' instead of '_id'
IssueSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

module.exports = mongoose.model('Issue', IssueSchema);