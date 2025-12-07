const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'General' },
  location: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['New', 'In Progress', 'Resolved'], 
    default: 'New' 
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