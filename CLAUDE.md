# CLAUDE.md - MCP Music DJ プロジェクト

## 🎯 プロジェクト概要

自然言語で音楽をリクエストできる MCP サーバーと Next.js アプリ

### 必要な認証情報（.env に記載済み）

- Spotify Client ID/Secret ✅
- OpenAI API Key

### 注意事項

MCP サーバーの理解のための PJ なので、テスト実装は省略

---

## 📋 Claude Code での実装手順

### STEP 1: プロジェクト初期化

```
以下の構造でMCP Music DJプロジェクトを作成してください：

mcp-music-dj/         # カレントディレクトリ
├── mcp-server/       # MCPサーバー
├── web/              # Next.js
└── .env             # 既に作成済み

各ディレクトリのpackage.jsonとtsconfig.jsonも作成してください。
```

### STEP 2: MCP サーバー実装

```
mcp-server/ディレクトリに以下のファイルを作成してください：
- src/index.ts (MCPサーバーメイン)
- src/spotify.ts (Spotify APIクライアント)
- src/ai.ts (OpenAI連携)
- src/tools.ts (MCPツール定義)

実装要件：
- search_musicツールを実装
- 自然言語プロンプトをAIで解析
- Spotify APIで楽曲検索
```

### STEP 3: Next.js フロントエンド

```
web/ディレクトリにNext.js App Routerで実装してください：
- チャットUI（自然言語入力）
- 楽曲リスト表示
- 音楽プレイヤー（30秒プレビュー）
- MCPサーバーとの通信
```

---

## 🛠 実装ルール

### 1. コード品質

- **TypeScript**: 厳密な型定義
- **エラーハンドリング**: try-catch で適切に処理
- **非同期処理**: async/await を使用
- **コメント**: 複雑な処理には日本語コメント

### 2. ファイル構成

```typescript
// 良い例: 単一責任の原則
// spotify.ts - Spotify APIのみ
// ai.ts - OpenAI APIのみ
// index.ts - MCPサーバーロジックのみ
```

### 3. 命名規則

- **変数/関数**: camelCase
- **型/インターフェース**: PascalCase
- **定数**: UPPER_SNAKE_CASE
- **ファイル**: kebab-case

### 4. MCP サーバー固有のルール

```typescript
// 必須: StdioServerTransportを使用
const transport = new StdioServerTransport();

// 必須: ツールレスポンスの形式
return {
  content: [
    {
      type: "text",
      text: JSON.stringify(result),
    },
  ],
};
```

### 5. セキュリティ

- 環境変数は.env から読み込み
- API キーをコードに直接書かない
- エラーメッセージに機密情報を含めない

---

## 🔧 技術仕様

### MCP サーバー

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "axios": "^1.6.0",
    "openai": "^4.0.0",
    "dotenv": "^16.0.0"
  }
}
```

### Next.js

```json
{
  "dependencies": {
    "next": "14.x",
    "axios": "^1.6.0",
    "lucide-react": "latest"
  }
}
```

### API レスポンス形式

```typescript
interface SearchMusicResponse {
  success: boolean;
  prompt: string;
  analysis: {
    searchQuery: string;
    mood?: string;
    genre?: string;
    energy?: number;
  };
  tracks: Track[];
  message: string;
}
```

---

## 📝 実装の詳細

### 1. AI プロンプト解析（ai.ts）

```typescript
// OpenAI APIでプロンプトを解析
// 入力: "カフェで流れるようなジャズ"
// 出力: { searchQuery: "jazz cafe ambient", mood: "calm", genre: "jazz" }
```

### 2. Spotify 検索（spotify.ts）

```typescript
// Client Credentials認証
// 楽曲検索（日本市場）
// 人気度でソート
```

### 3. MCP ツール（tools.ts）

```typescript
{
  name: 'search_music',
  description: '自然言語のリクエストから音楽を検索',
  inputSchema: {
    properties: {
      prompt: { type: 'string' },
      limit: { type: 'number', default: 10 }
    }
  }
}
```

### 4. フロントエンド通信（api/mcp/route.ts）

```typescript
// MCPサーバーをサブプロセスで起動
// JSONRPCで通信
// タイムアウト: 15秒
```

---

## 🚨 エラー処理

### 想定されるエラー

1. **API 認証エラー**: 環境変数を確認
2. **楽曲が見つからない**: より具体的なプロンプト
3. **タイムアウト**: MCP サーバーの起動確認
4. **プレビューなし**: Spotify の仕様（全曲にはない）

---

## 🧪 動作確認

### MCP サーバー単体テスト

```bash
cd mcp-server
npm run build
node dist/index.js
# JSONRPCリクエストを手動入力して確認
```

### 統合テスト

```bash
cd web
npm run dev
# http://localhost:3000で動作確認
```

### テストプロンプト例

- "カフェで流れるようなボサノバ"
- "朝のランニングに最適な曲"
- "90 年代の懐かしい J-POP"
- "集中できるインストゥルメンタル"

---

## 💡 Claude Code との対話例

### 初期実装

```
私: CLAUDE.mdの内容に従ってMCP Music DJプロジェクトを作成してください
Claude: [プロジェクト全体を生成]
```

### 機能追加

```
私: プレイリスト機能を追加したい
Claude: [既存コードを理解して機能追加]
```

### デバッグ

```
私: MCPサーバーでこのエラーが出ました: [エラー内容]
Claude: [原因分析と解決策を提示]
```

### リファクタリング

```
私: spotify.tsのコードをもっとクリーンにしたい
Claude: [改善されたコードを提供]
```

---

## 🎯 完成基準

1. ✅ 自然言語で音楽検索できる
2. ✅ AI がプロンプトを理解する
3. ✅ 実際の Spotify 楽曲が表示される
4. ✅ プレビュー再生ができる
5. ✅ エラーが適切に処理される

---

## 🔥 注意事項

- **API レート制限**: Spotify API は秒間リクエスト数に制限あり
- **OpenAI コスト**: GPT-3.5-turbo で低コスト運用
- **プレビュー**: 全楽曲にあるわけではない（Spotify 仕様）
- **著作権**: 30 秒プレビューのみ（フル再生は別途契約必要）
