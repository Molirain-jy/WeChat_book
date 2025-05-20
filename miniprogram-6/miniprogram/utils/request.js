// 后端服务器地址
const BASE_URL = 'http://127.0.0.1:3000/api';

// 获取用户ID (示例用固定ID，实际从微信登录获取,记得加)
const getUserId = () => {

  // 检查本地缓存中是否有userId
  let userId = wx.getStorageSync('userId');
  
  // 如果没有，就创建一个随机ID
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    wx.setStorageSync('userId', userId);
  }
  
  return userId;
};

// 封装请求方法
const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json',
        'userId': getUserId()
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          console.error('请求失败:', res);
          reject(res.data || { message: '请求失败' });
        }
      },
      fail: (err) => {
        console.error('网络错误:', err);
        reject({ message: '网络错误' });
      }
    });
  });
};

// 文件上传封装
const uploadFile = (filePath, formData = {}) => {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${BASE_URL}/books/upload`,
      filePath,
      name: 'book',
      formData: {
        ...formData,
        userId: getUserId()
      },
      success: (res) => {
        if (res.statusCode === 201) {
          try {
            const data = JSON.parse(res.data);
            resolve(data);
          } catch (error) {
            reject({ message: '解析响应失败' });
          }
        } else {
          try {
            reject(JSON.parse(res.data));
          } catch (error) {
            reject({ message: '上传失败' });
          }
        }
      },
      fail: (err) => {
        reject({ message: '网络错误', error: err });
      }
    });
  });
};

// 文件下载封装
const downloadFile = (bookId) => {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: `${BASE_URL}/books/${bookId}/download`,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath);
        } else {
          reject({ message: '下载失败' });
        }
      },
      fail: (err) => {
        reject({ message: '网络错误', error: err });
      }
    });
  });
};

module.exports = {
  request,
  uploadFile,
  downloadFile,
  getUserId,
  BASE_URL
};