# 微信小程序-图书系统
一个可以上传，下载，收藏，在线阅读的微信小程序
---
## 后端
请将js中所有包含127.0.0.1的IP替换为自己的服务器地址，若配置ssl加密请自行将链接改成https。  
index中使用了[一言api](https://github.com/hitokoto-osc/hitokoto-api)，这是我自己部署的，但是不想泄露自己的域名就换成了官方的url。开源项目，请支持原作者。  
目前只提供docker部署示例
部署步骤
```bash
#先将reading-app-serve文件夹压缩起来然后发送到服务器（scp之类的方法都可以）
#然后解压，这部分命令不予展示
cd reading-app-serve

#然后使用docker-compose部署（如果报错请使用docker compose,取决于你安装的什么）
docker-compose up -d --build

#提供了一个一键加入官方书籍的脚本，可以进入容器并运行，脚本可根据需要修改，在部署项目之前先修改好
docker exec -it reading-app-serve-app-1 sh
cd /app
node scripts/add-official-books.js
node update-book-flags.js
```
如果有部分安装失败多半是网络问题，请链接国际互联网重试  

---
## Last
欢迎提交 Issues 和 Pull requests
