const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://mongo:27017/reading_app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 导入 Book 模型 (或重新定义一个简单版本)
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  filePath: String,
  fileSize: Number,
  uploadedBy: String,
  isOfficial: Boolean
});

const Book = mongoose.model('Book', bookSchema);

async function updateBooks() {
  try {
    // 将所有 uploadedBy 不是 'admin' 的书籍标记为非官方
    const result = await Book.updateMany(
      { uploadedBy: { $ne: 'admin' } },
      { $set: { isOfficial: false } }
    );
    
    console.log(`更新了 ${result.modifiedCount} 本用户上传的书籍为非官方书籍`);
    
    // 将所有 uploadedBy 是 'admin' 的书籍但没有设置 isOfficial 的书籍标记为官方
    const result2 = await Book.updateMany(
      { uploadedBy: 'admin', isOfficial: { $ne: true } },
      { $set: { isOfficial: true } }
    );
    
    console.log(`更新了 ${result2.modifiedCount} 本管理员上传的书籍为官方书籍`);
    
    // 检查结果
    const officialCount = await Book.countDocuments({ isOfficial: true });
    const userCount = await Book.countDocuments({ isOfficial: false });
    const unsetCount = await Book.countDocuments({ isOfficial: { $exists: false } });
    
    console.log('统计结果:');
    console.log(`- 官方书籍: ${officialCount}`);
    console.log(`- 用户书籍: ${userCount}`);
    console.log(`- 未设置标记: ${unsetCount}`);
    
  } catch (error) {
    console.error('更新书籍标记出错:', error);
  } finally {
    mongoose.disconnect();
  }
}

updateBooks();