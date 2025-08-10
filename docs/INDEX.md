# リアルタイム掲示板 ドキュメント索引

このディレクトリには、リアルタイム掲示板（Codexエージェントテスト用）の設計・実装に関するドキュメント一式が含まれています。

## ドキュメント構成

### 📋 要件・設計
- **[main_docs.md](./main_docs.md)** - 要件定義・基本/詳細設計書（メインドキュメント）
  - 概要、ステークホルダー、機能要件、非機能要件
  - システム設計、データモデル、画面設計
  - 詳細設計（バックエンド・フロントエンド・データベース）

### 🔌 API・通信仕様
- **[openapi.yaml](./openapi.yaml)** - REST API仕様（OpenAPI 3.0.3形式）
  - 認証、ルーム管理、メッセージ、招待リンクのエンドポイント
  - リクエスト/レスポンススキーマ、エラーレスポンス定義
- **[ws_events.md](./ws_events.md)** - WebSocketイベント定義
  - クライアント↔サーバー間のリアルタイム通信仕様
  - イベント種別、ペイロード、エラーハンドリング

### 🎨 UI設計
- **[ui_flow.mmd](./ui_flow.mmd)** - UI画面遷移図（Mermaid形式）
  - ログイン〜ルーム管理〜メッセージ投稿の画面フロー
  - 招待リンクによる非公開ルーム参加フロー

### 🚀 実装・運用
- **[README_Codex.md](./README_Codex.md)** - Codex実装ガイド
  - NestJS + Angular構成での実装手順
  - Codexエージェント向けプロンプト例
  - 型生成、テスト実行コマンド
- **[NEXT_ACTIONS.md](./NEXT_ACTIONS.md)** - 実装前チェックリスト
  - 技術的意思決定項目
  - セキュリティ・運用準備
  - テスト・リリース準備

### 🧪 テスト・品質保証
- **[k6_smoke_test.js](./k6_smoke_test.js)** - 負荷テストスクリプト
  - REST API の基本動作確認
  - P95レスポンス時間、エラー率の測定

## 利用方法

### 1. 要件確認
`main_docs.md` で全体要件・設計を確認

### 2. API仕様確認
`openapi.yaml` + `ws_events.md` で通信仕様を確認

### 3. 実装開始
1. `NEXT_ACTIONS.md` のチェックリスト確認
2. `README_Codex.md` のガイドに従って実装開始
3. `ui_flow.mmd` を参考に画面実装

### 4. テスト実行
```bash
# API型生成
npx openapi-typescript ./docs/openapi.yaml -o ./frontend/src/types/api.ts

# 負荷テスト実行
k6 run -e BASE_URL=https://api.example.com/api/v1 -e ACCESS_TOKEN=YOUR_JWT ./docs/k6_smoke_test.js
```

## 技術スタック

- **バックエンド**: NestJS 10, PostgreSQL, Redis, Socket.IO
- **フロントエンド**: Angular 18, RxJS
- **認証**: JWT（Access/Refresh）
- **リアルタイム**: WebSocket（Socket.IO）

## ディレクトリ構成（推奨）

```
/
├── backend/          # NestJS アプリケーション
├── frontend/         # Angular アプリケーション
└── docs/            # このディレクトリ
    ├── main_docs.md
    ├── openapi.yaml
    ├── ws_events.md
    ├── ui_flow.mmd
    ├── k6_smoke_test.js
    ├── README_Codex.md
    ├── NEXT_ACTIONS.md
    └── INDEX.md        # このファイル
```

## 更新履歴

- 2025-08-10: 初版作成（v0.3.1）
- ドキュメント分割・整理、OpenAPI仕様詳細化
- Codex実装ガイド、負荷テストスクリプト追加
