const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bookController = require('../controllers/bookController');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 只接受txt文件
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/plain' || path.extname(file.originalname).toLowerCase() === '.txt') {
    cb(null, true);
  } else {
    cb(new Error('只允许上传TXT文件'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 限制10MB
});

// 获取所有书籍
router.get('/', bookController.getAllBooks);

// 获取官方书籍
router.get('/official', bookController.getOfficialBooks);

// 获取书籍分类
router.get('/categories', bookController.getBookCategories);

// 获取单本书籍信息
router.get('/:id', bookController.getBook);

// 上传书籍
router.post('/upload', upload.single('book'), bookController.uploadBook);

// 下载书籍
router.get('/:id/download', bookController.downloadBook);

// 阅读书籍
router.get('/:id/read', bookController.readBook);

// 删除书籍
router.delete('/:id', bookController.deleteBook);

module.exports = router;