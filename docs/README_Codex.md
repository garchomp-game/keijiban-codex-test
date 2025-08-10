# Codex 実装ガイド（最短ルート）

## 目的
`/docs` の仕様（OpenAPI / WSイベント / UI遷移図）を元に、NestJS + Angular の雛形を **Codex** に生成させるための最小プロンプトと手順。

## 前提
- サーバ: NestJS 10, PostgreSQL, Redis, Socket.IO
- フロント: Angular 18, RxJS
- 認証: JWT（Access/Refresh）
- 非公開ルーム: RoomMember によるアクセス制御
- 仕様のソースオブトゥルース: `docs/openapi.yaml`

## ディレクトリ配置（推奨）
```
/backend
/frontend
/docs
├─ openapi.yaml
├─ ws_events.md
├─ ui_flow.mmd
└─ NEXT_ACTIONS.md
```

## Codex への最小プロンプト例（バックエンド）
> NestJS 10 で `auth`, `users`, `rooms`, `messages`, `invites`, `gateway` モジュールを作成。  
> `docs/openapi.yaml` のスキーマに準拠した DTO/Controller を生成。  
> 認可: JwtAuthGuard + RolesGuard + RoomMemberGuard（private対応）。  
> メッセージIDは ULID。`(userId, clientMsgId)` のユニーク制約で冪等性。  
> Socket.IO Gateway は namespace `/ws`、イベントは `docs/ws_events.md` に従う。  
> DB は PostgreSQL、マイグレーションは Prisma を使用。  
> まずはプロジェクト初期化とモジュールの雛形、DTO/エンティティの型を出力して。

## Codex への最小プロンプト例（フロント）
> Angular 18。画面は `docs/ui_flow.mmd` に準拠（ログイン、ルーム一覧、ルーム詳細、プロフィール、管理：ルーム管理）。  
> `openapi.yaml` から型を生成して API サービスを実装（openapi-typescript を利用）。  
> WebSocket サービスは Socket.IO クライアントで `/ws` に接続、`ws_events.md` のイベントに対応。  
> まずはルーティングと空のコンポーネント、API/WS サービスの骨組みを出力して。

## 型生成例
```bash
# フロントの型生成（例）
npm i -D openapi-typescript
npx openapi-typescript ./docs/openapi.yaml -o ./frontend/src/types/api.ts
```

## k6 スモークテスト実行例
```bash
k6 run -e BASE_URL=https://api.example.com/api/v1 -e ACCESS_TOKEN=YOUR_JWT ./docs/k6_smoke_test.js
```

## 注意
- 招待リンクは 24h のワンタイム。サーバ側で消費済み/期限切れを必ず検証。
- 権限なしは 403（301 は利用しない）。
