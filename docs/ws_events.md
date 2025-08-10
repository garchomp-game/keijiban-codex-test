# WebSocket イベント定義（草案）
Namespace: `/ws`（JWT必須）

## クライアント → サーバ
- `room:join` — `{ roomId }` → ack
- `room:left` — `{ roomId }` → ack
- `message:send` — `{ clientMsgId, roomId, body }` → ack（payloadに保存済みMessage）
- `message:edit` — `{ messageId, body }` → ack
- `message:delete` — `{ messageId }` → ack

## サーバ → クライアント（broadcast）
- `message:delivered` — `{ message }`
- `message:edited` — `{ message }`
- `message:deleted` — `{ messageId }`
- `room:updated` — `{ room }`
- `room:archived` — `{ roomId }`
- `room:members:updated` — `{ roomId, members: RoomMember[] }`

## エラー方針
- 認証失敗: 接続拒否（HTTP 401相当）
- 権限不足: ackで`{ ok: false, error: { status: 403, title: 'Forbidden' } }`
- レート超過: ackで`{ ok: false, error: { status: 429, title: 'Too Many Requests' } }`
