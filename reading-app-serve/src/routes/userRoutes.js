const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 获取或创建用户
router.get('/:userId', userController.getOrCreateUser);

// 获取用户收藏
router.get('/:userId/favorites', userController.getFavorites);

// 添加收藏
router.post('/:userId/favorites', userController.addFavorite);

// 取消收藏
router.delete('/:userId/favorites/:bookId', userController.removeFavorite);

// 获取阅读历史
router.get('/:userId/history', userController.getReadingHistory);

// 更新阅读进度
router.post('/:userId/history', userController.updateReadingProgress);

module.exports = router;