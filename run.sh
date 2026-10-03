#!/data/data/com.termux/files/usr/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd)"
CONF="$HOME/.sshserver.conf"
NODE_FILE="$DIR/sshserver.js"

# 依赖检查
if [ ! -d "$DIR/node_modules/ws" ] || [ ! -d "$DIR/node_modules/ssh2" ]; then
    echo "检测到依赖缺失，正在安装 ws ssh2 "
    cd "$DIR" || exit 1
    npm install ws ssh2 || { echo "依赖安装失败"; exit 1; }
    echo "依赖安装完成"
    echo ""
fi

# 载入旧配置
[ -f "$CONF" ] && source "$CONF"

if [ -f "$CONF" ]; then
    read -rp "检测到已有配置，是否重新设置？[y/N] " opt
    if [[ "$opt" != "y" && "$opt" != "Y" ]]; then
        cd "$DIR" || exit 1
        echo "启动：http://localhost:$WEB_PORT"
        echo "按 Ctrl+C 停止"
        echo ""
        SSH_HOST="$SSH_HOST" SSH_PORT="$SSH_PORT" \
        SSH_USER="$SSH_USER" SSH_PASS="$SSH_PASS" WEB_PORT="$WEB_PORT" \
        node "$NODE_FILE"
        exit 0
    fi
fi

ask() {
    local p="$1" d="$2" v
    read -rp "$p [$d]: " v
    echo "${v:-$d}"
}

echo "============ Web SSH 配置 ============="
SSH_HOST=$(ask "SSH 主机" "${SSH_HOST:-127.0.0.1}")
SSH_PORT=$(ask "SSH 端口" "${SSH_PORT:-2222}")
SSH_USER=$(ask "SSH 登录用户" "${SSH_USER:-root}")
read -rsp "SSH 登录密码 [${SSH_PASS:-root}]: " TMP; echo
SSH_PASS="${TMP:-${SSH_PASS:-root}}"
WEB_PORT=$(ask "网页端口" "${WEB_PORT:-8080}")

cat > "$CONF" <<EOF
SSH_HOST="$SSH_HOST"
SSH_PORT="$SSH_PORT"
SSH_USER="$SSH_USER"
SSH_PASS="$SSH_PASS"
WEB_PORT="$WEB_PORT"
EOF

echo ""
echo "配置已保存到 $CONF"
echo "启动：http://localhost:$WEB_PORT"
echo "按 Ctrl+C 停止"
echo ""

cd "$DIR" || exit 1
SSH_HOST="$SSH_HOST" SSH_PORT="$SSH_PORT" \
SSH_USER="$SSH_USER" SSH_PASS="$SSH_PASS" WEB_PORT="$WEB_PORT" \
node "$NODE_FILE"