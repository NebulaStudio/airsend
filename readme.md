# AIRSEND 隔空发送

airsend 是一个受苹果的隔空投递启发的 Web 应用程序。它允许你在设备之间传输文件，文本和超级链接，而你不必上传到任何的服务器。它基于 WebRTC 进行开发，点对点传输。

[演示地址](https://airsend.cn/)

## 浏览器支持

- 谷歌浏览器
- 微软 Edge （基于 Chromium 内核)
- Safari 13 及以上版本
- Firfox

## 如何部署

项目由三部分组成

1. 基于 Vue 的前端 render
2. 基于 Express 的信令服务 server
3. P2P 打洞和中转服务 [coturn](https://github.com/coturn/coturn)

由于对 turn 做了鉴权，coturn 在部署时，使用 mongodb 作为存储。关于如何部署 coturn 后续会单独说明。

### 如何运行

#### 1. 安装 mongodb 服务

#### 2. 部署 coturn 服务

#### 3. 下载代码，编译
```
1.  git clone https://github.com/NebulaStudio/airsend.git
2.  cd render
3.  npm install
4.  npm run build
5.  cd ../server
6.  npm install
7.  修改 server/config.js 中的 mongodbUrl，databaseName 以及 iceServer
8.  npm run dev
```
## TODO LIST

- 兼容移动端
- 重新设计-发送粘贴板的体验

## License

MIT
