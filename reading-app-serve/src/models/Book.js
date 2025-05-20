const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    default: '佚名',
    trim: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  },
  downloads: {
    type: Number,
    default: 0
  },
  // 是否官方书籍
  isOfficial: {
    type: Boolean,
    default: false
  },
  // 封面图片URL
  coverUrl: {
    type: String,
    default: ''
  },
  // 分类
  category: {
    type: String,
    default: '其他'
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);