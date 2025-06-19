#!/bin/bash

echo "🎵 MCP Music DJ セットアップを開始します..."

# MCPサーバーのセットアップ
echo "📦 MCPサーバーの依存関係をインストール中..."
cd mcp-server
npm install
npm run build
cd ..

# Next.jsのセットアップ  
echo "📦 Next.jsアプリの依存関係をインストール中..."
cd web
npm install
cd ..

echo "✅ セットアップが完了しました！"
echo ""
echo "🚀 起動方法："
echo "1. ターミナル1: cd web && npm run dev"
echo "2. ブラウザで http://localhost:3000 を開く"
echo ""
echo "⚠️  注意: .envファイルに以下の環境変数が設定されていることを確認してください："
echo "- SPOTIFY_CLIENT_ID"
echo "- SPOTIFY_CLIENT_SECRET"
echo "- OPENAI_API_KEY"