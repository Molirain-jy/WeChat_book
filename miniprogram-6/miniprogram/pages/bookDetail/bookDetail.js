const { request, getUserId } = require('../../utils/request.js');

Page({
  data: {
    bookId: '',
    book: null,
    isFavorite: false,
    userId: '',
    loading: true,
    fileSizeDisplay: '',
    timeDisplay: ''
  },
  
  onLoad(options) {
    const { id } = options;
    this.setData({ 
      bookId: id,
      userId: getUserId()
    });
    
    this.fetchBookDetails();
    this.checkIfFavorite();
  },
  
  // 获取书籍详情
  async fetchBookDetails() {
    try {
      const book = await request(`/books/${this.data.bookId}`);
      
      // 格式化显示数据
      const fileSizeDisplay = ((book.fileSize || 0) / 1024).toFixed(2) + 'KB';
      const timeDisplay = this.formatTime(book.createdAt);
      
      this.setData({ 
        book,
        fileSizeDisplay,
        timeDisplay,
        loading: false
      });
    } catch (error) {
      wx.showToast({
        title: '获取书籍详情失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },
  
  // 检查是否已收藏
  async checkIfFavorite() {
    try {
      const favorites = await request(`/users/${this.data.userId}/favorites`);
      const isFavorite = favorites.some(book => book._id === this.data.bookId);
      this.setData({ isFavorite });
    } catch (error) {
      console.error('检查收藏状态失败', error);
    }
  },
  
  // 收藏/取消收藏
  async toggleFavorite() {
    try {
      if (this.data.isFavorite) {
        // 取消收藏
        await request(`/users/${this.data.userId}/favorites/${this.data.bookId}`, 'DELETE');
        wx.showToast({ title: '已取消收藏' });
      } else {
        // 添加收藏
        await request(`/users/${this.data.userId}/favorites`, 'POST', { bookId: this.data.bookId });
        wx.showToast({ title: '收藏成功' });
      }
      this.setData({ isFavorite: !this.data.isFavorite });
    } catch (error) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },
  
  // 开始阅读
  startReading() {
    wx.navigateTo({
      url: `/pages/reader/reader?id=${this.data.bookId}`
    });
  },
  
  // 下载书籍
  downloadBook() {
    const { book } = this.data;
    wx.showLoading({ title: '准备下载...' });
    
    // 使用微信API下载文件
    wx.downloadFile({
      url: `http://127.0.0.1:3000/api/books/${this.data.bookId}/download`,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          // 打开文件
          wx.openDocument({
            filePath: res.tempFilePath,
            showMenu: true,
            success: () => {
              console.log('打开文档成功');
            }
          });
        } else {
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },

  // 显示删除确认
  showDeleteConfirm() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这本书吗？',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          this.deleteBook();
        }
      }
    });
  },

  // 删除书籍
  async deleteBook() {
    wx.showLoading({ title: '删除中...' });
    try {
      await request(`/books/${this.data.bookId}`, 'DELETE', { userId: this.data.userId });
      wx.hideLoading();
      wx.showToast({ title: '删除成功' });
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  // 格式化时间
  formatTime(dateStr) {
    if (!dateStr) return '未知时间';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
});