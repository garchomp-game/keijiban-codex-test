# （修正版 v0.3.1）要件定義・基本/詳細設計 — リアルタイム掲示板（Codexエージェントのテスト用)

* 作成日: 2025-08-10
* バージョン: **0.3.1（修正）**
* 作成: おとか様（クライアント）／SE（アシスタント）

---

## 0. 概要（Executive Summary）

* **背景**: Codexエージェントの性能評価用テストベッドとして、リロード無しのリアルタイム掲示板/チャットを提供。
* **解決したい課題**: 迅速なコミュニケーションとエージェント連携の検証。
* **ターゲットユーザー**: B2C（同時アクセス〜数百、登録は数千規模）。
* **想定リリース**: 技術スパイク（1日）→ MVP（1–2週間目安、進捗次第）。
* **KPI（案）**: P95配信遅延≦500ms、配信成功率≧99.9%、同接500安定、エラー率≦0.1%/min。

---

## 1. ステークホルダー

| 区分     | 氏名/組織        | 役割      | 責務         | RACI |
| ------ | ------------ | ------- | ---------- | ---- |
| 事業責任者  | クライアント（おとか様） | 事業判断    | スコープ/KPI承認 | A    |
| PO     | 同上           | 要件優先度   | MVP合意      | A    |
| テックリード | SE           | 技術選定/設計 | アーキ/品質/非機能 | R    |
| 開発     | 開発チーム        | 実装      | FE/BE/テスト  | R    |
| 運用     | TBD          | 監視/障害対応 | 体制/Runbook | C    |

---

## 2. スコープ定義

### 2.1 本スコープ

* リアルタイム掲示板/チャット（複数ルーム、公開中心）
* 投稿/編集（**無制限・編集履歴は保持しない**）/削除（本人/モデレーター）
* 既読/未読の簡易表現（未読数/最終閲覧）
* 認証（Email+PW/JWT）＋プロフィール
* モデレーション（通報/NGワード/レート制限）
* **管理者のルームCRUD＋公開/非公開の設定・メンバー管理**
* **招待リンク（ワンタイム/24h）による非公開参加**
* Web通知（任意）

### 2.2 アウトオブスコープ

* 決済、サブスク
* 高度なSNS（フォロー/タイムライン/DM）
* 外部SaaS/API連携（初期は無し）

### 2.3 前提・制約

* **NestJS + Angular**、WebSocket（Socket.IO案）
* コンテナ前提（Docker）
* 同接: 初期500（将来1,000）
* 1日スパイク結果でMVP計画を再評価

---

## 3. ユースケース & 業務フロー

### 3.1 主要ユースケース

1. サインアップ/ログイン
2. 公開ルームの閲覧と過去ログ取得
3. ルーム参加とメッセージ投稿
4. <500ms目標で他クライアントへ配信
5. **投稿の編集/削除はいつでも可（監査ログのみ保持）**
6. 通報/NGワード/モデレーター削除
7. 切断→再接続時の欠損補完
8. **招待リンク（24h）で非公開ルームに参加**
9. 管理者がルームを作成/更新/アーカイブ/削除

### 3.2 To-Be 概要

* 認証後、JWTでSocket接続
* 入室→直近N件ロード→以降はリアルタイム配信
* 投稿は永続化→配信（At-least-once）
* 監査/モデレーションは別チャンネルで記録

---

## 4. 機能要件（概要）

| 機能ID  | 機能名      | 説明                           | 優先度    | 受入条件              |
| ----- | -------- | ---------------------------- | ------ | ----------------- |
| F-001 | 認証/認可    | Email+PW、JWT（Access/Refresh） | Must   | ログイン/更新/失効、トークン検証 |
| F-002 | ルーム閲覧/参加 | 公開一覧/入室/退出                   | Must   | 入室で履歴N件、退出で購読解除   |
| F-003 | 投稿/配信    | 低遅延配信（P95≦500ms）             | Must   | 送信→他端末表示、順序安定     |
| F-004 | 履歴取得     | 無限スクロール、欠損補完                 | Must   | 欠損0、重複なし          |
| F-005 | 編集/削除    | **無制限・履歴保持なし**               | Should | 監査ログ残存、UI即時更新     |
| F-006 | モデレーション  | 通報/NGワード/BAN/ミュート            | Should | ルール通りに制御          |
| F-007 | 通知       | 未読/mention通知                 | Could  | 権限許諾後に通知          |
| F-008 | 観測/運用    | メトリクス/ログ/APM                 | Must   | ダッシュボード可視化        |
| F-009 | ルーム管理    | 管理者のCRUD/可視性                 | Must   | Admin限定/監査ログ      |

---

## 5. データ要件

### 5.1 主要エンティティ

| エンティティ          | 主キー                 | 主な属性                                                                                  | 関連                              |
| --------------- | ------------------- | ------------------------------------------------------------------------------------- | ------------------------------- |
| User            | user\_id(UUID)      | email, password\_hash, display\_name, role                                            | Message(1\:N)                   |
| Room            | room\_id(UUID)      | name, description, visibility(public/private), is\_archived, created\_at, updated\_at | Message(1\:N), RoomMember(1\:N) |
| Message         | msg\_id(ULID)       | room\_id, user\_id, body, status, created\_at, edited\_at                             | User(N:1), Room(N:1)            |
| RoomMember      | (room\_id,user\_id) | role\_in\_room(owner/admin/member), joined\_at                                        | Room(N:1), User(N:1)            |
| ModerationEvent | mod\_id(UUID)       | actor\_id, target\_id, action, reason, created\_at                                    | User                            |
| Token           | token\_id           | user\_id, expires\_at, revoked                                                        | User                            |

### 5.2 データ品質・リテンション

* 入力検証: 本文≤4000、XSSサニタイズ
* 一意制約: email unique、ULIDで時系列安定
* 保持: メッセージ無期限、**編集履歴は保持しない**、監査ログ1年

---

## 6. 外部インターフェース

* 認証: 自前（JWT, PBKDF2/Argon2）
* 決済: なし
* メール: SMTP（初期ダミー）
* 外部API: なし

---

## 7. 非機能要件

### 7.1 性能/容量

* 同接500（将来1,000）
* 配信SLO: P95≦500ms
* ピーク: 50 msg/sec（将来100）

### 7.2 可用性/信頼性

* 可用性: 99.9%（MVPはBest Effort）
* RTO/RPO: 1h/15min
* 単AZ→将来マルチAZ

### 7.3 セキュリティ

* JWT（短命Access/長命Refresh）
* TLS/HSTS/CSPほか
* XSS/CSRF/SQLi対策、レート制限
* 監査ログ、PII最小化

### 7.4 運用/監視

* 指標: CPU/mem/socket/msg/sec/latency/エラー
* アラート: P95/エラー率/接続枯渇
* バックアップ: 日次、リストア演習
* リリース: Rolling（将来Canary）

### 7.5 拡張性/保守性

* 分割: auth/rooms/messages/moderation/gateway/admin
* テスト: Jest/Playwright/k6
* 可観測性: 将来OpenTelemetry

### 7.6 法令/規格

* 個人情報: 最小収集、目的明示、退会/削除API

---

## 8. 基本設計（ハイレベル）

### 8.1 構成（論理）

* FE: Angular SPA（WSクライアント）
* API: NestJS（REST）
* RT: NestJS WebSocket Gateway（Socket.IO）
* データ: PostgreSQL / Redis
* 逆プロキシ: Nginx

### 8.2 技術スタック候補

* Angular 18 / RxJS / Material
* NestJS 10 / TypeORM or Prisma / Socket.IO / class-validator
* PostgreSQL 16 / Redis 7
* Docker / GitHub Actions

### 8.3 API設計方針

* REST + WebSocket
* `/api/v1` 版管理
* 認可: JWT + **RoomMemberチェック（private対応）**
* エラー: RFC7807

### 8.4 データモデル（ERD要旨）

* User(1)-Message(N), Room(1)-Message(N)
* ModerationEvent は Message/User に紐づく

### 8.5 画面基本設計（MVP）

* ログイン/サインアップ、ルーム一覧、ルーム詳細、プロフィール、**管理：ルーム管理（CRUD・公開/非公開・メンバー管理）**
* 入力制御: 本文必須/4000字以内、URL自動リンク

### 8.6 権限・ロール

* 役割: guest / user / moderator / **admin**
* 可視性: public（誰でも）/ **private（メンバーのみ）**
* privateはRoomMember登録者のみ

### 8.7 ログ/監査

* login/logout, post/create/edit/delete, room CRUD, member add/remove, invite create/accept
* PIIマスキング（emailハッシュ表示）

### 8.8 エラー・リトライ

* 冪等性: clientMsgId(ULID)
* 再送: クライアント指数バックオフ

---

## 9. 受入基準（UAT）

* 正常系E2E：ログイン→入室→投稿→配信→再接続→編集/削除
* P95配信遅延≦500ms（同接200）
* 欠損0、重複なし
* NGワードブロック/マスク
* ルームCRUDはAdmin限定、監査ログ記録

---

## 10. リスク & 対応

| リスク           | 影響      | 発生確率 | 対策                    |
| ------------- | ------- | ---- | --------------------- |
| WebSocketスケール | 遅延/切断   | 中    | Redis PubSubで水平化、接続監視 |
| フロント描画負荷      | スクロール劣化 | 中    | 仮想リスト/バッチ描画           |
| モデレーション負荷     | 不適切投稿   | 中    | レート制限/NG辞書/モデレータUI    |
| データ増加         | 容量圧迫    | 低    | 古いログのアーカイブ            |

---

## 11. スケジュール（概略）

| フェーズ    | 期間   | 成果物           |
| ------- | ---- | ------------- |
| 技術スパイク  | 1日   | スパイク結果/ボトルネック |
| MVP実装   | 1–2週 | 動くMVP/負荷計画    |
| UAT/微修正 | 1週   | 受入合格/Runbook  |

---

## 12. 成果物一覧

* 要件定義書（本書）
* 基本設計書（別紙）
* 画面遷移図、ER図、API仕様（OpenAPI）
* 試験観点リスト（UAT）

---

## 13. API仕様（OpenAPI）

完全なAPI仕様は [`openapi.yaml`](./openapi.yaml) を参照してください。

### 概要
- **ベースURL**: `https://api.example.com/api/v1`
- **認証方式**: JWT Bearer Token
- **エラーレスポンス**: RFC7807準拠のProblemオブジェクト

### 主要エンドポイント
### 主要エンドポイント

| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| POST | `/auth/signup` | サインアップ | - |
| POST | `/auth/login` | ログイン | - |
| GET | `/rooms` | ルーム一覧取得 | 認証済み |
| POST | `/rooms` | ルーム作成 | 管理者 |
| GET | `/rooms/{roomId}` | ルーム詳細取得 | 認証済み + アクセス権 |
| PATCH | `/rooms/{roomId}` | ルーム更新 | 管理者 |
| DELETE | `/rooms/{roomId}` | ルーム削除 | 管理者 |
| GET | `/rooms/{roomId}/messages` | メッセージ履歴取得 | 認証済み + アクセス権 |
| POST | `/messages` | メッセージ投稿 | 認証済み + アクセス権 |
| PATCH | `/messages/{messageId}` | メッセージ編集 | 投稿者本人 |
| DELETE | `/messages/{messageId}` | メッセージ削除 | 投稿者本人 |
| POST | `/invites` | 招待リンク作成 | 管理者 |
| POST | `/invites/accept` | 招待リンク受理 | 認証済み |

詳細なスキーマ定義、リクエスト/レスポンス例は [`openapi.yaml`](./openapi.yaml) を参照してください。

---

## 14. WebSocketイベント定義

WebSocketイベントの詳細は [`ws_events.md`](./ws_events.md) を参照してください。

### 概要
- **Namespace**: `/ws`（JWT必須）
- **接続認証**: JWTトークンによる認証
- **ack方式**: `{ ok: boolean, error?: Problem }`

### 主要イベント

#### クライアント → サーバ
- `room:join` — ルーム参加
- `room:left` — ルーム退出  
- `message:send` — メッセージ送信
- `message:edit` — メッセージ編集
- `message:delete` — メッセージ削除

#### サーバ → クライアント（broadcast）
- `message:delivered` — 新しいメッセージの配信
- `message:edited` — メッセージ編集の通知
- `message:deleted` — メッセージ削除の通知
- `room:updated` — ルーム情報更新
- `room:members:updated` — メンバー一覧更新

---

## 15. UI画面遷移図

画面遷移の詳細は [`ui_flow.mmd`](./ui_flow.mmd) を参照してください（Mermaid形式）。

### 主要画面
- **ログイン/サインアップ**: 認証画面
- **ルーム一覧**: 公開/非公開ルーム表示、管理者機能へのアクセス
- **ルーム詳細**: メッセージ表示・投稿・編集・削除
- **プロフィール**: ユーザー情報管理
- **管理：ルーム管理**: ルームCRUD、メンバー管理、招待リンク発行

### 招待フロー
1. 管理者が招待リンク発行（24時間有効）
2. 招待リンクをメール送信
3. ユーザーがリンクをクリック→ログイン要求
4. ログイン成功→自動的に非公開ルームにメンバー登録

---

## 16. テスト・品質保証

### 負荷テスト
k6を使用したスモークテストが [`k6_smoke_test.js`](./k6_smoke_test.js) に定義されています。

実行例：
```bash
k6 run -e BASE_URL=https://api.example.com/api/v1 -e ACCESS_TOKEN=YOUR_JWT ./docs/k6_smoke_test.js
```

### 品質目標
- **P95レスポンス時間**: ≤500ms
- **リクエスト失敗率**: <1%
- **同時接続**: 500ユーザー（将来1,000）

---

## 17. 実装ガイド

Codexエージェントを使用した実装ガイドは [`README_Codex.md`](./README_Codex.md) を参照してください。

### 技術スタック
- **バックエンド**: NestJS 10, PostgreSQL, Redis, Socket.IO
- **フロントエンド**: Angular 18, RxJS
- **認証**: JWT（Access/Refresh）
- **リアルタイム**: WebSocket（Socket.IO）

### 実装前チェックリスト
実装開始前の確認事項は [`NEXT_ACTIONS.md`](./NEXT_ACTIONS.md) を参照してください。

---

## 18. 成果物一覧

### ドキュメント
- [`main_docs.md`](./main_docs.md) - 要件定義・基本/詳細設計（本書）
- [`openapi.yaml`](./openapi.yaml) - REST API仕様（OpenAPI 3.0.3）
- [`ws_events.md`](./ws_events.md) - WebSocketイベント定義
- [`ui_flow.mmd`](./ui_flow.mmd) - UI画面遷移図（Mermaid形式）
- [`README_Codex.md`](./README_Codex.md) - Codex実装ガイド
- [`NEXT_ACTIONS.md`](./NEXT_ACTIONS.md) - 実装前チェックリスト

### テスト・品質保証
- [`k6_smoke_test.js`](./k6_smoke_test.js) - 負荷テストスクリプト

### ファイル構成
```
/docs
├── main_docs.md          # 要件定義・設計書（メイン）
├── openapi.yaml          # REST API仕様
├── ws_events.md          # WebSocketイベント定義
├── ui_flow.mmd           # UI画面遷移図
├── k6_smoke_test.js      # 負荷テストスクリプト
├── README_Codex.md       # Codex実装ガイド
└── NEXT_ACTIONS.md       # 実装前チェックリスト
```

---

* **Modules**: auth / users / rooms / messages / invites / moderation / gateway / observability
* **DTO/Validation**: LoginDto, CreateRoomDto, PostMessageDto, EditMessageDto, CreateInviteDto
* **Auth**: Access(短命)/Refresh(長命)＋ローテーション、JwtAuthGuard/RolesGuard/RoomMemberGuard
* **ページング**: ULID主キー、`before`+`limit`
* **冪等性**: `(userId, clientMsgId)`ユニーク
* **Rate limit**: 投稿20/10s/ユーザー、ログイン5/60s/IP
* **エラー**: RFC7807
* **監査**: login/logout, message CRUD, room CRUD, invite create/accept

---

## 19. 詳細設計（バックエンド）

### モジュール構成
- **auth**: 認証・認可（JWT管理）
- **users**: ユーザー管理
- **rooms**: ルーム管理（CRUD、メンバー管理）
- **messages**: メッセージ管理（投稿・編集・削除）
- **invites**: 招待リンク管理
- **moderation**: モデレーション機能
- **gateway**: WebSocket Gateway（Socket.IO）
- **observability**: 監視・ログ

### 認証・認可
- **JwtAuthGuard**: JWTトークン検証
- **RolesGuard**: ユーザーロール検証（admin/moderator/user）
- **RoomMemberGuard**: 非公開ルームアクセス権検証
- **トークン管理**: Access（短命）/Refresh（長命）のローテーション

### DTO/Validation
- **LoginDto**: email, password
- **CreateRoomDto**: name, description, visibility
- **PostMessageDto**: roomId, body, clientMsgId
- **EditMessageDto**: body
- **CreateInviteDto**: roomId, expiresInHours

### データ整合性
- **冪等性**: `(userId, clientMsgId)`のユニーク制約
- **メッセージID**: ULID形式で時系列順序保証
- **ページング**: `before`（ULID）+ `limit`による後方ページング

### レート制限
- **投稿**: 20件/10秒/ユーザー
- **ログイン**: 5回/60秒/IP
- **招待リンク生成**: 10件/時間/ユーザー

### エラーハンドリング
- **RFC7807**: Problem Details for HTTP APIs準拠
- **統一エラーレスポンス**: type, title, status, detail, instance

### 監査ログ
- **対象イベント**: login/logout, message CRUD, room CRUD, invite create/accept
- **ログ形式**: JSON構造化ログ
- **保持期間**: 1年間

---

## 20. 詳細設計（データベース）

（PostgreSQL/抜粋は前稿と同様。users/rooms/room\_members/messages/refresh\_tokens/invites、推奨Index明記）

---

## 21. 詳細設計（フロントエンド）

### モジュール構成
- **auth**: 認証（ログイン・サインアップ・トークン管理）
- **rooms**: ルーム一覧・詳細表示
- **messages**: メッセージ表示・投稿・編集・削除
- **admin**: 管理者機能（ルーム管理・メンバー管理）
- **invites**: 招待リンク管理・受理
- **profile**: プロフィール管理

### サービス層
- **api.service.ts**: REST API呼び出し（HTTP client）
- **ws.service.ts**: WebSocket接続管理（Socket.IO client）
- **auth.service.ts**: 認証状態管理・トークン更新
- **notification.service.ts**: ブラウザ通知管理

### 状態管理
- **方式**: Angular Signals または RxJS BehaviorSubject
- **認証状態**: ユーザー情報・ログイン状態
- **ルーム状態**: 現在のルーム・メンバー一覧
- **メッセージ状態**: メッセージ履歴・リアルタイム更新

### リアルタイム通信
- **WebSocket再接続**: 指数バックオフによる自動再接続
- **オフライン対応**: 接続状態表示・メッセージキューイング
- **欠損補完**: 再接続時の差分取得

### UI/UX
- **仮想スクロール**: 大量メッセージの効率的描画
- **Optimistic UI**: 投稿・編集の即座反映
- **リアルタイム表示**: WebSocket経由のライブ更新
- **レスポンシブデザイン**: モバイル・デスクトップ対応

### 型安全性
- **OpenAPI型生成**: `openapi-typescript`によるAPI型生成
- **WebSocketイベント型**: イベントごとの型定義
- **型ガード**: ランタイム型検証

### パフォーマンス最適化
- **OnPush変更検知**: 不要な再描画防止
- **TrackBy関数**: リスト描画の最適化
- **Lazy Loading**: ルート単位の遅延読み込み
- **画像最適化**: アバター・添付ファイルの最適化

---

## 22. テスト設計（抜粋）

* 観点: **過去ログ取得**（ページング）、投稿/編集/削除/招待受理、P95遅延、レート制限、XSS
* 自動化: Jest / Playwright / k6

---

## 23. 運用設計（抜粋）

* 監視: sockets/msg/sec/P95/5xx
* アラート: P95>500ms(5分)/5xx>1%
* バックアップ: 日次、保持30日（演習/四半期）
* リリース: Rolling→将来Canary

---

## 24. リスク・変更管理

* 招待リンク流出 → 使い捨て/24h/（任意でIP/UA縛り）
* 非公開ルーム誤公開 → 可視性変更E2Eを必須

