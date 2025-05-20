const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 连接到数据库
mongoose.connect('mongodb://mongo:27017/reading_app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 导入 Book 模型
const Book = require('../src/models/Book');

// 官方书籍数据
const officialBooks = [
  {
    title: '红楼梦',
    author: '曹雪芹',
    description: '《红楼梦》，中国古代章回体长篇小说，中国古典四大名著之一。其通行本共120回，一般认为前80回是清代作家曹雪芹所著，后40回作者有争议。小说以贾、史、王、薛四大家族的兴衰为背景，以贾府的家庭琐事、闺阁闲情为脉络，以贾宝玉、林黛玉、薛宝钗的爱情婚姻悲剧为主线，刻画了以贾宝玉和金陵十二钗为中心的正邪两赋有情人的人性美和悲剧美。',
    category: '古典文学',
    isOfficial: true,
    coverUrl: 'https://img9.doubanio.com/view/subject/s/public/s1070959.jpg'
  },
  {
    title: '西游记',
    author: '吴承恩',
    description: '《西游记》是中国古代第一部浪漫主义章回体长篇神魔小说。现存明刊百回本《西游记》均无作者署名。清代学者吴玉搢等首先提出《西游记》作者是明代吴承恩。这部小说以"唐僧取经"这一历史事件为蓝本，通过作者的艺术加工，深刻地描绘了当时的社会现实。',
    category: '古典文学',
    isOfficial: true,
    coverUrl: 'https://img1.doubanio.com/view/subject/s/public/s1627374.jpg'
  },
  {
    title: '三国演义',
    author: '罗贯中',
    description: '《三国演义》是中国古典四大名著之一，是中国第一部长篇章回体历史演义小说，全名为《三国志通俗演义》（又称《三国志演义》），由元末明初小说家罗贯中创作而成。',
    category: '古典文学',
    isOfficial: true,
    coverUrl: 'https://img2.doubanio.com/view/subject/s/public/s1076932.jpg'
  },
  {
    title: '水浒传',
    author: '施耐庵',
    description: '《水浒传》是中国古典四大名著之一，全书描写北宋末年以宋江为首的108位好汉从聚义梁山泊到受朝廷招安，再到东征西讨的传奇故事，塑造了一批栩栩如生的英雄人物形象。',
    category: '古典文学',
    isOfficial: true,
    coverUrl: 'https://img2.doubanio.com/view/subject/s/public/s23579646.jpg'
  },
  {
    title: '战争与和平',
    author: '列夫·托尔斯泰',
    description: '《战争与和平》是俄国作家列夫·托尔斯泰创作的长篇小说，是一部描写1812年俄法战争中俄国社会各阶层的生活图景和心灵世界的宏大历史画卷，被誉为"世界上最伟大的小说"。',
    category: '外国文学',
    isOfficial: true,
    coverUrl: 'https://img2.doubanio.com/view/subject/s/public/s1148102.jpg'
  },
  {
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    description: '《百年孤独》是哥伦比亚作家加西亚·马尔克斯的代表作，也是拉丁美洲魔幻现实主义文学的代表作，描写了布恩迪亚家族七代人的传奇故事，以及加勒比海沿岸小镇马孔多的百年兴衰，反映了拉丁美洲一个世纪以来风云变幻的历史。',
    category: '外国文学',
    isOfficial: true,
    coverUrl: 'https://img1.doubanio.com/view/subject/s/public/s6384944.jpg'
  },
  {
    title: '简·爱',
    author: '夏洛蒂·勃朗特',
    description: '《简·爱》是英国女作家夏洛蒂·勃朗特创作的长篇小说，讲述了一个从小变成孤儿的英国女子简·爱的成长历程，刻画了她追求平等和自由、坚持自我的坚强形象，歌颂了真诚、正直、自尊、自立的崇高品格。',
    category: '外国文学',
    isOfficial: true,
    coverUrl: 'https://img2.doubanio.com/view/subject/s/public/s5924326.jpg'
  },
  {
    title: '傲慢与偏见',
    author: '简·奥斯汀',
    description: '《傲慢与偏见》是英国女性作家简·奥斯汀的代表作，是一部描写爱情与婚姻的经典小说。作品通过描写乡绅之女伊丽莎白·班内特与富有地主达西从互相偏见到互相理解、互相爱慕的过程，反映了18世纪末19世纪初英国乡村生活的风貌和当时保守的婚姻观念。',
    category: '外国文学',
    isOfficial: true,
    coverUrl: 'https://img9.doubanio.com/view/subject/s/public/s4250062.jpg'
  },
  {
    title: '边城',
    author: '沈从文',
    description: '《边城》是中国现代作家沈从文的代表作，小说以20世纪30年代川湘交界的边城小镇茶峒为背景，以兼具抒情诗和小品文的优美笔触，描绘了湘西边城淳朴的风土人情，讲述了船家少女翠翠的爱情悲剧。',
    category: '现代文学',
    isOfficial: true,
    coverUrl: 'https://img2.doubanio.com/view/subject/s/public/s1595557.jpg'
  },
  {
    title: '围城',
    author: '钱钟书',
    description: '《围城》是钱钟书所著的长篇小说，被誉为"中国现代文学史上的里程碑"。小说描写了抗战初期知识分子的群相，借主人公方鸿渐的经历，表现了当时一代知识分子的踌躇、彷徨、无奈与悲剧。',
    category: '现代文学',
    isOfficial: true,
    coverUrl: 'https://img2.doubanio.com/view/subject/s/public/s1070222.jpg'
  }
];

// 执行添加书籍的函数
async function addOfficialBooks() {
  try {
    // 清空旧的官方书籍
    await Book.deleteMany({ isOfficial: true });
    console.log('旧的官方书籍已清空');
    
    // 准备官方书籍的TXT文件
    for (let book of officialBooks) {
      // 创建一个简单的TXT文件内容
      const content = `${book.title}\n\n作者：${book.author}\n\n${book.description}\n\n这是官方提供的电子书示例内容，完整内容请下载正式版。`;
      
      // 文件名和路径
      const safeTitle = book.title.replace(/[^\w\s]/gi, '_');
      const fileName = `${Date.now()}-${safeTitle}.txt`;
      const filePath = path.join(__dirname, '..', 'uploads', fileName);
      
      // 写入文件
      fs.writeFileSync(filePath, content);
      
      // 创建书籍记录
      await Book.create({
        ...book,
        filePath,
        fileSize: content.length,
        uploadedBy: 'admin',
        uploadedAt: new Date()
      });
      
      console.log(`添加了官方书籍: ${book.title}`);
    }
    
    console.log('所有官方书籍添加完成！');
  } catch (error) {
    console.error('添加官方书籍失败:', error);
  } finally {
    // 关闭数据库连接
    mongoose.disconnect();
  }
}

// 运行函数
addOfficialBooks();