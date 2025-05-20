const { request } = require('../../utils/request.js');

Page({
  data: {
    categories: ['全部'],
    currentCategory: '全部',
    books: [],
    filteredBooks: [],
    loading: true,
    searchKey: '',
    scrollTop: 0,
    showBackToTop: false
  },
  
  onLoad() {
    this.fetchCategories();
    this.fetchBooks();
  },
  
  onPageScroll(e) {
    // 当页面滚动到一定高度时显示回到顶部按钮
    const showBackToTop = e.scrollTop > 300;
    if (this.data.showBackToTop !== showBackToTop) {
      this.setData({ showBackToTop });
    }
  },
  
  // 获取所有分类
  async fetchCategories() {
    try {
      const categories = await request('/books/categories');
      this.setData({ categories });
    } catch (error) {
      console.error('获取分类失败', error);
      wx.showToast({
        title: '获取分类失败',
        icon: 'none'
      });
    }
  },
  
  // 获取书籍列表
  async fetchBooks() {
    this.setData({ loading: true });
    
    try {
      // 根据当前选择的分类获取书籍
      const category = this.data.currentCategory;
      const queryString = category !== '全部' ? `?category=${encodeURIComponent(category)}` : '';
      
      const books = await request(`/books/official${queryString}`);
      
      // 处理书籍数据，添加必要的展示属性
      const processedBooks = books.map(book => {
        return {
          ...book,
          coverUrl: book.coverUrl || '',  // 确保有封面URL
          downloads: book.downloads || 0  // 确保有下载次数
        };
      });
      
      this.setData({
        books: processedBooks,
        filteredBooks: processedBooks,
        loading: false
      });
    } catch (error) {
      console.error('获取书籍失败', error);
      wx.showToast({
        title: '获取书籍失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },
  
  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    if (category !== this.data.currentCategory) {
      this.setData({
        currentCategory: category,
        searchKey: ''  // 切换分类时清空搜索
      });
      this.fetchBooks();
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
  
  // 根据搜索关键词过滤书籍
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
  
  // 跳转到书籍详情页
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/bookDetail/bookDetail?id=${id}`
    });
  },
  
  // 回到顶部
  scrollToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.fetchBooks().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});