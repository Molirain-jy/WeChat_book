const { request, getUserId } = require('../../utils/request.js');
const { formatTime } = require('../../utils/util.js');

Page({
  data: {
    books: [],
    filteredBooks: [],
    loading: true,
    searchKey: '',
    hitokoto: '加载中...',
    hitokoto0:getUserId()
  },
  
  onLoad() {
    this.fetchBooks();
    
    // 确保用户存在
    this.ensureUserExists();

    //获取一言
    wx.request({
        url: 'https://v1.hitokoto.cn//?encode=json',
        success: (res) => {
          this.setData({
            hitokoto: res.data.hitokoto
          });
        },
        fail: () => {
          this.setData({
            hitokoto: '获取失败 :('
          });
        }
      });
  },
  
  onShow() {
    // 每次回到页面时刷新数据
    this.fetchBooks();
  },
  
  onPullDownRefresh() {
    this.fetchBooks();
  },
  
  // 获取书籍列表
  async fetchBooks() {
    this.setData({ loading: true });
    try {
      const books = await request('/books');
      
      // 对书籍数据进行预处理，添加显示用的属性
      const processedBooks = books.map(book => {
        return {
          ...book,
          fileSizeDisplay: ((book.fileSize || 0) / 1024).toFixed(1) + 'KB',
          timeDisplay: book.createdAt ? this.formatTime(book.createdAt) : '未知时间'
        };
      });
      
      this.setData({ 
        books: processedBooks,
        filteredBooks: processedBooks,
        loading: false
      });
    } catch (error) {
      wx.showToast({
        title: '获取书籍失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
    wx.stopPullDownRefresh();
  },
  
  // 确保用户在系统中存在
  async ensureUserExists() {
    const userId = getUserId();
    try {
      await request(`/users/${userId}`);
    } catch (error) {
      console.error('获取用户信息失败', error);
    }
  },
  
  // 搜索输入
  onSearchInput(e) {
    const searchKey = e.detail.value.trim();
    this.setData({ searchKey });
    this.filterBooks();
  },
  
  // 清除搜索
  clearSearch() {
    this.setData({ 
      searchKey: '',
      filteredBooks: this.data.books
    });
  },
  
  // 过滤书籍
  filterBooks() {
    if (!this.data.searchKey) {
      this.setData({ filteredBooks: this.data.books });
      return;
    }
    
    const filtered = this.data.books.filter(book => {
      return book.title.toLowerCase().includes(this.data.searchKey.toLowerCase()) ||
             (book.author && book.author.toLowerCase().includes(this.data.searchKey.toLowerCase()));
    });
    
    this.setData({ filteredBooks: filtered });
  },
  
  // 跳转到书籍详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/bookDetail/bookDetail?id=${id}`
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
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
});
