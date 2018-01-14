# WebMusicView
慕课网上学习的一个小例子，让音乐看得见 Node.js+express+ejs


确保安装nodejs和npm
参考
http://note.youdao.com/noteshare?id=722de713e29e8566f4a48b70b0c07e88
express是nodejsweb运用开发工具，详细介绍
http://www.expressjs.com.cn/

express项目默认代码注解
https://www.jianshu.com/p/9e06d4e859ab


1) 安装express
>>npm install -g express-generator
/usr/local/bin/express -> /usr/local/lib/node_modules/express-generator/bin/express-cli.js

2）安装项目 server是项目名称
>>express -e server

3）进入server目录
>>cd server

4）安装其他的依赖
>>npm install

5)安装监控启动工具
>>npm install -g supervisor

6)启动项目
>>supervisor bin/www

浏览器访问
http://127.0.0.1:3000


