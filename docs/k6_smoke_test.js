import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<500'], // P95 <= 500ms
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'https://api.example.com/api/v1';
const TOKEN = __ENV.ACCESS_TOKEN || '';

export default function () {
  const params = { headers: { Authorization: `Bearer ${TOKEN}` } };

  // Rooms list (public)
  const res = http.get(`${BASE}/rooms?visibility=public`, params);
  check(res, { 'list rooms 200': (r) => r.status === 200 });

  // Fetch messages of a sample room if exists
  try {
    const rooms = res.json();
    if (rooms && rooms.length) {
      const roomId = rooms[0].roomId;
      const msgs = http.get(`${BASE}/rooms/${roomId}/messages?limit=50`, params);
      check(msgs, { 'messages 200': (r) => r.status === 200 });
    }
  } catch (e) {
    // ignore json parse error in dry runs
  }

  sleep(1);
}
