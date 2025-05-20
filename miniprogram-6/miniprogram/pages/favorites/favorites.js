const api = require('../../utils/api')
const PAGE_SIZE = 10

Page({
  data: {
    bookList: [],      // 收藏列表
    total: 0,          // 总收藏数
    page: 1,           // 当前页码
    loading: false,    // 加载状态
    noMore: false,     // 没有更多数据
    activeSort: 'time',// 当前排序方式
    sortOptions: [     // 排序选项
      { label: '按时间', value: 'time' },
      { label: '按书名', value: 'title' }
    ]
  },

  // 初始化加载
  onLoad() {
    this.loadFavoriteBooks()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ page: 1, noMore: false })
    this.loadFavoriteBooks().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载更多
  onReachBottom() {
    if (!this.data.noMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadFavoriteBooks()
    }
  },

  // 加载收藏书籍
  async loadFavoriteBooks() {
    if (this.data.loading || this.data.noMore) return

    this.setData({ loading: true })
    
    try {
      const params = {
        page: this.data.page,
        pageSize: PAGE_SIZE,
        sort: this.data.activeSort
      }

      const res = await api.getFavoriteBooks(params)
      
      this.setData({
        bookList: this.data.page === 1 
          ? res.data.list 
          : [...this.data.bookList, ...res.data.list],
        total: res.data.total,
        noMore: res.data.list.length < PAGE_SIZE
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 切换收藏状态
  async toggleFavorite(e) {
    const bookId = e.currentTarget.dataset.id
    const index = this.data.bookList.findIndex(item => item._id === bookId)
    
    try {
      // 立即更新UI
      this.setData({
        [`bookList[${index}].isFavorite`]: false
      })
      
      await api.toggleFavoriteBook(bookId)
      wx.showToast({ title: '已取消收藏' })
      
      // 重新加载数据保持同步
      this.loadFavoriteBooks()
    } catch (err) {
      // 失败时恢复状态
      this.setData({
        [`bookList[${index}].isFavorite`]: true
      })
      wx.showToast({ title: '操作失败', icon: 'error' })
    }
  },

  // 切换排序方式
  handleSort(e) {
    const sortValue = e.currentTarget.dataset.value
    if (this.data.activeSort === sortValue) return
    
    this.setData({
      activeSort: sortValue,
      page: 1,
      noMore: false
    }, () => {
      this.loadFavoriteBooks()
    })
  }
})
