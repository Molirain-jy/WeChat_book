const { request, getUserId } = require('../../utils/request.js');

Page({
  data: {
    bookId: '',
    bookTitle: '',
    content: '',
    currentPosition: 0,
    totalLength: 0,
    fontSize: 16, // 默认字体大小
    loading: true,
    userId: '',
    showSettings: false,
    theme: 'light', // 默认主题: light, sepia, dark
    progressPercent: 0
  },
  
  onLoad(options) {
    const { id } = options;
    this.setData({ 
      bookId: id,
      userId: getUserId(),
      fontSize: wx.getStorageSync('fontSize') || 16,
      theme: wx.getStorageSync('theme') || 'light'
    });
    
    // 隐藏标题栏
    wx.setNavigationBarColor({
      frontColor: this.data.theme === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: this.data.theme === 'dark' ? '#222222' : '#f9f9e8'
    });
    
    // 获取阅读进度
    this.getReadingProgress();
  },
  
  // 获取阅读进度
  async getReadingProgress() {
    try {
      const history = await request(`/users/${this.data.userId}/history`);
      const bookHistory = history.find(item => item.bookId._id === this.data.bookId);
      
      if (bookHistory) {
        this.setData({ currentPosition: bookHistory.progress || 0 });
      }
      
      // 加载内容
      this.loadContent();
    } catch (error) {
      // 如果获取历史失败，直接加载内容
      this.loadContent();
    }
  },
  
  // 加载内容
  async loadContent() {
    this.setData({ loading: true });
    try {
      const result = await request(`/books/${this.data.bookId}/read?userId=${this.data.userId}&start=${this.data.currentPosition}&length=5000`);
      
      // 计算进度百分比
      const progressPercent = Math.ceil((this.data.currentPosition + result.content.length) / result.totalLength * 100);
      
      this.setData({
        bookTitle: result.title,
        content: result.content,
        totalLength: result.totalLength,
        progressPercent: progressPercent,
        loading: false
      });
    } catch (error) {
      wx.showToast({
        title: '获取内容失败',
        icon: 'none'
      });
      this.setData({ loading: false });
      
      // 失败后返回
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  // 下一页
  nextPage() {
    const newPosition = this.data.currentPosition + 5000;
    if (newPosition >= this.data.totalLength) {
      wx.showToast({
        title: '已经是最后一页',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ currentPosition: newPosition });
    this.loadContent();
    this.saveReadingProgress();
  },
  
  // 上一页
  prevPage() {
    const newPosition = Math.max(0, this.data.currentPosition - 5000);
    if (newPosition === this.data.currentPosition) {
      wx.showToast({
        title: '已经是第一页',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ currentPosition: newPosition });
    this.loadContent();
    this.saveReadingProgress();
  },
  
  // 保存阅读进度
  async saveReadingProgress() {
    try {
      await request(`/users/${this.data.userId}/history`, 'POST', {
        bookId: this.data.bookId,
        progress: this.data.currentPosition
      });
    } catch (error) {
      console.error('保存阅读进度失败', error);
    }
  },
  
  // 增大字体
  increaseFont() {
    if (this.data.fontSize >= 24) return;
    const newSize = this.data.fontSize + 2;
    this.setData({ fontSize: newSize });
    wx.setStorageSync('fontSize', newSize);
  },
  
  // 减小字体
  decreaseFont() {
    if (this.data.fontSize <= 12) return;
    const newSize = this.data.fontSize - 2;
    this.setData({ fontSize: newSize });
    wx.setStorageSync('fontSize', newSize);
  },
  
  // 切换设置面板
  toggleSettings() {
    this.setData({ showSettings: !this.data.showSettings });
  },
  
  // 选择主题
  selectTheme(e) {
    const { theme } = e.currentTarget.dataset;
    this.setData({ theme });
    wx.setStorageSync('theme', theme);
    
    // 更新导航栏颜色
    wx.setNavigationBarColor({
      frontColor: theme === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: theme === 'dark' ? '#222222' : '#f9f9e8'
    });
  },
  
  // 离开页面时保存进度
  onUnload() {
    this.saveReadingProgress();
  }
});