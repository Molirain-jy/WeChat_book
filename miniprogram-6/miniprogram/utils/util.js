/**
 * 格式化时间
 * @param {Date|string} date 日期对象或日期字符串
 * @param {string} format 格式化模式
 */
const formatTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    date = date instanceof Date ? date : new Date(date);
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
  
    const o = {
      'YYYY': year.toString(),
      'MM': month.toString().padStart(2, '0'),
      'DD': day.toString().padStart(2, '0'),
      'HH': hour.toString().padStart(2, '0'),
      'mm': minute.toString().padStart(2, '0'),
      'ss': second.toString().padStart(2, '0')
    };
  
    return Object.keys(o).reduce((prev, key) => {
      return prev.replace(key, o[key]);
    }, format);
  };
  
  /**
   * 格式化文件大小
   * @param {number} size 文件大小（字节）
   */
  const formatFileSize = (size) => {
    if (size < 1024) {
      return size + 'B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + 'KB';
    } else if (size < 1024 * 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + 'MB';
    } else {
      return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
    }
  };
  
  /**
   * 计算相对时间
   * @param {Date|string} dateTime 日期对象或日期字符串
   */
  const relativeTime = (dateTime) => {
    const now = new Date();
    const date = new Date(dateTime);
    const diff = now - date;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    
    if (diff < minute) {
      return '刚刚';
    } else if (diff < hour) {
      return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
      return Math.floor(diff / hour) + '小时前';
    } else if (diff < week) {
      return Math.floor(diff / day) + '天前';
    } else if (diff < month) {
      return Math.floor(diff / week) + '周前';
    } else {
      return formatTime(date, 'YYYY-MM-DD');
    }
  };
  
  /**
   * 防抖函数
   * @param {Function} func 要执行的函数 
   * @param {number} wait 延迟时间(ms)
   */
  const debounce = (func, wait) => {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  };
  
  /**
   * 检查文件类型是否合法
   * @param {string} fileName 文件名
   * @param {Array} allowedExtensions 允许的扩展名列表
   */
  const checkFileExtension = (fileName, allowedExtensions) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return allowedExtensions.includes(extension);
  };
  
  module.exports = {
    formatTime,
    formatFileSize,
    relativeTime,
    debounce,
    checkFileExtension
  };