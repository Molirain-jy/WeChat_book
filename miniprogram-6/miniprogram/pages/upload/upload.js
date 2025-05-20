const { uploadFile, getUserId } = require('../../utils/request.js');

Page({
  data: {
    filePath: '',
    fileName: '',
    fileSize: 0,
    fileSizeDisplay: '',
    title: '',
    author: '',
    description: '',
    uploading: false,
    userId: ''
  },
  
  onLoad() {
    this.setData({ userId: getUserId() });
  },
  
  // 选择文件
  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['txt'],
      success: (res) => {
        const file = res.tempFiles[0];
        
        // 判断文件格式
        if (!file.name.toLowerCase().endsWith('.txt')) {
          return wx.showToast({
            title: '只能上传TXT格式',
            icon: 'none'
          });
        }
        
        // 判断文件大小
        if (file.size > 10 * 1024 * 1024) {
          return wx.showToast({
            title: '文件不能超过10MB',
            icon: 'none'
          });
        }
        
        // 自动填充书名（去掉.txt扩展名）
        const defaultTitle = file.name.replace(/\.txt$/i, '');
        
        // 计算文件大小显示
        const fileSizeDisplay = (file.size / 1024).toFixed(2) + 'KB';
        
        this.setData({
          filePath: file.path,
          fileName: file.name,
          fileSize: file.size,
          fileSizeDisplay: fileSizeDisplay,
          title: defaultTitle
        });
      }
    });
  },
  
  // 表单输入
  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },
  
  // 上传文件
  async uploadBook() {
    if (!this.data.filePath) {
      return wx.showToast({
        title: '请先选择文件',
        icon: 'none'
      });
    }
    
    if (!this.data.title) {
      return wx.showToast({
        title: '请输入书名',
        icon: 'none'
      });
    }
    
    this.setData({ uploading: true });
    wx.showLoading({ title: '上传中...' });
    
    try {
      await uploadFile(this.data.filePath, {
        title: this.data.title,
        author: this.data.author,
        description: this.data.description,
        userId: this.data.userId
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      });
      
      // 上传成功后返回
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      });
    } finally {
      this.setData({ uploading: false });
    }
  }
});