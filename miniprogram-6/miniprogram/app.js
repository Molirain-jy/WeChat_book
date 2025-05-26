    // app.js
    App({
        onLaunch() {
        // 初始化云开发
        wx.cloud.init({
            env: 'cloud1-8groookrad2b1f6d', // 如：cloud1-xxxxx
            traceUser: true
        });
    
        // 调用云函数获取 openid
        wx.cloud.callFunction({
            name: 'getopenid'
        }).then(res => {
            const openid = res.result.openid;
            console.log('获取到 openid：', openid);
            wx.setStorageSync('userId', openid); // 存入本地缓存
        }).catch(err => {
            console.error('获取 openid 失败：', err);
        });
        }
    });
    
