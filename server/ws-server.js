const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// 간단한 토큰 인증 예시 (실서비스에서는 JWT 등으로 강화 필요)
function verifyToken(token) {
  // 예시: 'my-secret-token'만 허용
  return token === process.env.WS_SECRET;
}

wss.on('connection', function connection(ws, req) {
  // 쿼리스트링에서 토큰 추출 (ws://localhost:3001?token=xxx)
  const params = new URLSearchParams(req.url.replace(/^\//, ''));
  const token = params.get('token');
  if (!verifyToken(token)) {
    ws.close(4001, '인증 실패');
    return;
  }

  ws.on('message', function incoming(message) {
    // 모든 클라이언트에 메시지 브로드캐스트
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.send('WebSocket 연결 성공!');
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`WebSocket 서버가 ${PORT}번 포트에서 실행 중`);
}); 