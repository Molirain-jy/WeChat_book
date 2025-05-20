const Book = require('../models/Book');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// 获取所有书籍
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单本书籍
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: '找不到该书籍' });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 上传书籍
exports.uploadBook = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请上传文件' });
    }

    const { title, author, description } = req.body;
    const { userId } = req.body;

    const newBook = new Book({
      title: title || path.basename(req.file.originalname, '.txt'),
      author: author || '佚名',
      description: description || '',
      filePath: req.file.path,
      fileSize: req.file.size,
      uploadedBy: userId,
      isOfficial:false
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 下载书籍
exports.downloadBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: '找不到该书籍' });
    }

    // 增加下载计数
    book.downloads += 1;
    await book.save();

    const filePath = path.resolve(book.filePath);
    res.download(filePath, `${book.title}.txt`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 阅读书籍
exports.readBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: '找不到该书籍' });
    }

    const filePath = path.resolve(book.filePath);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: '书籍文件不存在' });
    }

    // 获取读取位置和长度
    const { start = 0, length = 5000 } = req.query;
    
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ message: '读取文件失败' });
      }
      
      // 截取所需部分内容
      const content = data.substring(parseInt(start), parseInt(start) + parseInt(length));
      
      res.status(200).json({
        bookId: book._id,
        title: book.title,
        content,
        totalLength: data.length
      });
    });

    // 更新阅读历史
    const { userId } = req.query;
    if (userId) {
      await User.findOneAndUpdate(
        { userId },
        { 
          $set: { 
            'readingHistory.$[elem].progress': parseInt(start),
            'readingHistory.$[elem].lastReadAt': new Date()
          }
        },
        { 
          arrayFilters: [{ 'elem.bookId': book._id }],
          new: true
        }
      );
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 删除书籍
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: '找不到该书籍' });
    }

    // 检查用户是否是上传者
    if (book.uploadedBy !== req.body.userId) {
      return res.status(403).json({ message: '只有上传者可以删除书籍' });
    }

    // 删除文件
    if (fs.existsSync(book.filePath)) {
      fs.unlinkSync(book.filePath);
    }

    // 从数据库删除
    await Book.findByIdAndDelete(req.params.id);
    
    // 从所有用户的收藏和历史中删除
    await User.updateMany(
      {},
      { 
        $pull: { 
          favoriteBooks: book._id,
          readingHistory: { bookId: book._id }
        }
      }
    );

    res.status(200).json({ message: '书籍已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取所有官方书籍
exports.getOfficialBooks = async (req, res) => {
  try {
    // 获取查询参数
    const { category } = req.query;
    
    // 构建查询条件
    const query = { isOfficial: true };
    if (category && category !== '全部') {
      query.category = category;
    }
    
    const books = await Book.find(query).sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取所有官方书籍分类
exports.getBookCategories = async (req, res) => {
  try {
    // 获取所有官方书籍的不重复分类
    const categories = await Book.distinct('category', { isOfficial: true });
    // 添加"全部"选项
    categories.unshift('全部');
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};