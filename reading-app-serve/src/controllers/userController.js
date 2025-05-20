const User = require('../models/User');
const Book = require('../models/Book');

// 获取或创建用户
exports.getOrCreateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    let user = await User.findOne({ userId });
    
    if (!user) {
      // 创建新用户
      user = new User({
        userId,
        favoriteBooks: [],
        readingHistory: []
      });
      await user.save();
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取用户收藏
exports.getFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId }).populate('favoriteBooks');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.status(200).json(user.favoriteBooks || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 添加收藏
exports.addFavorite = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bookId } = req.body;
    
    // 验证书籍存在
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: '书籍不存在' });
    }
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 检查是否已经收藏
    if (user.favoriteBooks.includes(bookId)) {
      return res.status(400).json({ message: '已经收藏过该书籍' });
    }
    
    user.favoriteBooks.push(bookId);
    await user.save();
    
    res.status(200).json({ message: '收藏成功' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 取消收藏
exports.removeFavorite = async (req, res) => {
  try {
    const { userId, bookId } = req.params;
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    user.favoriteBooks = user.favoriteBooks.filter(
      id => id.toString() !== bookId
    );
    
    await user.save();
    
    res.status(200).json({ message: '已取消收藏' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取阅读历史
exports.getReadingHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findOne({ userId })
      .populate('readingHistory.bookId');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 按最后阅读时间排序
    const sortedHistory = user.readingHistory
      .sort((a, b) => b.lastReadAt - a.lastReadAt);
    
    res.status(200).json(sortedHistory || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 更新阅读进度
exports.updateReadingProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bookId, progress } = req.body;
    
    // 验证书籍存在
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: '书籍不存在' });
    }
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 查找是否已有该书的阅读记录
    const historyIndex = user.readingHistory.findIndex(
      item => item.bookId.toString() === bookId
    );
    
    if (historyIndex > -1) {
      // 更新现有记录
      user.readingHistory[historyIndex].progress = progress;
      user.readingHistory[historyIndex].lastReadAt = new Date();
    } else {
      // 添加新记录
      user.readingHistory.push({
        bookId,
        progress,
        lastReadAt: new Date()
      });
    }
    
    await user.save();
    
    res.status(200).json({ message: '阅读进度已更新' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};