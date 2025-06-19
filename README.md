# MCP Music DJ

自然言語で音楽を検索できるMCPサーバーとNext.jsアプリケーション

## セットアップ

```bash
# 依存関係のインストールとビルド
./setup.sh
```

## 環境変数

`.env`ファイルに以下を設定:

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
OPENAI_API_KEY=your_openai_api_key
```

## 起動方法

```bash
# Next.jsアプリを起動
cd web
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 使い方

チャットインターフェースに自然言語でリクエスト:
- "カフェで流れるようなボサノバ"
- "朝のランニングに最適な曲"
- "90年代の懐かしいJ-POP"
- "集中できるインストゥルメンタル"