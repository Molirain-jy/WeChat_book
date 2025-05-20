# 微信小程序-图书系统
一个可以上传，下载，收藏，在线阅读的微信小程序
---
## 后端
请将js中所有包含127.0.0.1的IP替换为自己的服务器地址，若配置ssl加密请自行将链接改成https。  
部署步骤
```bash
#先将reading-app-serve文件夹压缩起来然后发送到服务器（scp之类的方法都可以）
#然后解压，这部分命令不予展示
cd reading-app-serve

#然后使用docker-compose部署（如果报错请使用docker compose,取决于你安装的什么）
docker-compose up -d --build
```
如果有部分安装失败多半是网络问题，请链接国际互联网重试  

---
## Last
欢迎提交 Issues 和 Pull requests
