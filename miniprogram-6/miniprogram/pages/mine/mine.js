const { request, getUserId } = require('../../utils/request.js');

Page({
  data: {
    userId: '',
    favorites: [],
    history: [],
    myUploads: [],
    loading: true
  },
  
  onLoad() {
    this.setData({ userId: getUserId() });
  },
  
  onShow() {
    this.fetchData();
  },
  
  // 获取数据
  async fetchData() {
    this.setData({ loading: true });
    
    try {
      // 并行请求数据
      const [favorites, history, allBooks] = await Promise.all([
        request(`/users/${this.data.userId}/favorites`),
        request(`/users/${this.data.userId}/history`),
        request('/books')
      ]);
      
      // 过滤出自己上传的书籍
      const myUploads = allBooks.filter(book => book.uploadedBy === this.data.userId);
      
      // 处理阅读历史数据，添加进度百分比和格式化时间
      const processedHistory = history.map(item => {
        // 计算进度百分比
        const progressPercent = Math.ceil((item.progress || 0) / 
                              ((item.bookId && item.bookId.fileSize) || 1) * 100);
        
        return {
          ...item,
          progressPercent: progressPercent > 100 ? 100 : progressPercent,
          lastReadAtDisplay: this.formatTime(item.lastReadAt)
        };
      });
      
      this.setData({
        favorites,
        history: processedHistory,
        myUploads,
        loading: false
      });
    } catch (error) {
      wx.showToast({
        title: '获取数据失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },
  
  // 跳转到书籍详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/bookDetail/bookDetail?id=${id}`
    });
  },
  
  // 直接进入阅读器
  goToReader(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/reader/reader?id=${id}`
    });
  },
  
  // 跳转到上传页面
  goToUpload() {
    wx.navigateTo({
      url: '/pages/upload/upload'
    });
  },
  
  // 格式化时间
  formatTime(dateStr) {
    if (!dateStr) return '未知时间';
    
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now - date;
    
    // 1分钟内
    if (diff < 60 * 1000) {
      return '刚刚';
    }
    // 1小时内
    else if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}分钟前`;
    }
    // 1天内
    else if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
    }
    // 1月内
    else if (diff < 30 * 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
    }
    // 其它
    else {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
  }
});