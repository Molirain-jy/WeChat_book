const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  favoriteBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  readingHistory: [{
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    progress: {
      type: Number,
      default: 0
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);