// server.js
const net = require("net");

// TCPサーバーを作る
const server = net.createServer((socket) => {
  console.log("✅ Client connected!");

  // クライアントからデータを受け取る
  socket.on("data", (chunk) => {
    console.log("📩 Received:", chunk.toString());
  });

  // クライアントが切断したとき
  socket.on("end", () => {
    console.log("❌ Client disconnected");
  });
});

// ポート5000で待つ
server.listen(5000, () => {
  console.log("🚀 TCP Server running on port 5000");
});
