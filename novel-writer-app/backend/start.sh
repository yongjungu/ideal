#!/bin/bash

# 小说写作助手后端启动脚本

echo "=============================================="
echo "  小说写作助手后端服务启动脚本"
echo "=============================================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: npm 未安装，请先安装 npm"
    exit 1
fi

# 检查环境配置文件
if [ ! -f ".env" ]; then
    echo "警告: .env 文件不存在，请先配置环境变量"
    echo "正在创建示例配置文件..."
    cp .env.example .env
    echo "请编辑 .env 文件并配置必要的环境变量"
    exit 1
fi

# 安装依赖
echo "正在安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "错误: 依赖安装失败"
    exit 1
fi

# 检查运行模式
if [ "$1" = "dev" ]; then
    echo "启动开发模式..."
    npm run dev
else
    echo "启动生产模式..."
    npm start
fi
