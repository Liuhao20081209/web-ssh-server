## Web SSH Server

一个轻量级的网页版 SSH 终端，让你可以直接在浏览器中访问服务器的 SSH 命令行。基于 Node.js、WebSocket 和 xterm.js 实现，界面自适应移动端，适合在手机或电脑上快速连接和管理远程主机。

## 功能特性

·  纯网页终端：无需安装 SSH 客户端，打开浏览器即可连接
·  移动端适配：内置虚拟按键（ESC、TAB、CTRL、ALT、方向键等），支持手机操作
·  明暗主题切换：一键切换深色/浅色界面
·  系统信息展示：自动显示远程主机的操作系统、内核版本和架构
· 配置持久化：首次运行引导配置，配置保存至 ~/.sshserver.conf
·  基础防护：单 IP 请求频率限制 + WebSocket 并发连接数限制
· 依赖自动安装：检测到缺失依赖时自动执行 npm install

## 环境要求

· Node.js（建议 14 及以上）
· npm
· 支持 Termux（Android）、Linux、macOS 等类 Unix 环境

## 安装与使用

1. 安装依赖（无需执行，直接执行“2”）

```bash
npm install ws ssh2
```

2. 启动服务

```bash
bash run.sh
```

首次运行会提示输入 SSH 连接信息：

配置项 说明 默认值
SSH 主机 目标服务器地址 127.0.0.1
SSH 端口 SSH 服务端口 2222
SSH 登录用户 登录用户名 root
SSH 登录密码 登录密码 root
网页端口 本地 Web 服务端口 8080

配置会保存到 ~/.sshserver.conf，下次启动时可选择是否重新设置

3. 访问终端

启动后浏览器打开：

```
http://localhost:8080
```

按 Ctrl+C 可停止服务

## 项目结构

```
.
├── run.sh          # 启动脚本：依赖检查、配置交互、启动服务
├── sshserver.js    # 核心服务：HTTP + WebSocket + SSH 桥接
└── README.md
```
## 效果预览
```
浅色效果：
```
![浅色效果](https://raw.githubusercontent.com/Liuhao20081209/web-ssh-server/main/light.jpg)
```
深色效果：
```
![深色效果](https://raw.githubusercontent.com/Liuhao20081209/web-ssh-server/main/dark.jpg)
## 工作原理

1. run.sh 检查并安装依赖，读取/写入配置文件，通过环境变量将配置传给 Node 进程。
2. sshserver.js 启动 HTTP 服务，返回内嵌 xterm.js 的终端页面。
3. 浏览器通过 WebSocket 连接服务端；服务端使用 ssh2 建立到目标主机的 SSH 连接并打开 shell。
4. 双向转发数据：浏览器输入 → WebSocket → SSH shell；SSH 输出 → WebSocket → 终端渲染。
5. 连接建立时额外执行 uname 命令，把系统信息推送到前端显示。

## 安全说明

· 本项目通过 WebSocket 明文传输 SSH 密码与终端数据，请勿直接暴露在公网
· 如需外网访问，建议配合 HTTPS 反向代理（如 Nginx + TLS），并设置强密码
· 代码内置了简单的 IP 限流（HTTP 每秒 20 次、WebSocket 单 IP 最多 3 个并发连接），但这不能替代完善的认证机制
· 生产环境请考虑增加登录鉴权、IP 白名单等安全措施

## 常见问题

Q：启动时报错 依赖安装失败？
A：请确认已正确安装 Node.js 和 npm，且当前目录有网络访问权限。也可手动执行 npm install ws ssh2

Q：手机浏览器打开后键盘遮挡终端？
A：页面已针对 visualViewport 做适配，键盘弹出时会自动调整终端高度并隐藏虚拟按键栏。若仍有问题，请尝试更新浏览器

Q：连接后立即断开？
A：请检查 SSH 主机、端口、用户名、密码是否正确，以及目标主机是否允许密码登录

Q：如何修改配置？
A：删除 ~/.sshserver.conf 后重新运行 run.sh，或在启动时选择“重新设置”

## Powered by

· ws —— WebSocket 服务端
· ssh2 —— SSH 客户端
· xterm.js —— 浏览器终端组件

## License

MIT