const net = require("net");

// TCPサーバー
const server = net.createServer((socket) => {
  console.log("✅ Client connected");

  let buffer = Buffer.alloc(0);

  socket.on("data", (chunk) => {
    // ① chunkをbufferに追加
    buffer = Buffer.concat([buffer, chunk]);

    // ② whileで「読めるだけ読む」
    while (buffer.length >= 4) {
      // 長さヘッダーを読む
      const msgLength = buffer.readUInt32BE(0);

      // まだ全部届いてないなら待つ
      if (buffer.length < 4 + msgLength) break;

      // メッセージ本体を切り出す
      const msgBody = buffer.slice(4, 4 + msgLength);

      // bufferから削除（次のメッセージへ）
      buffer = buffer.slice(4 + msgLength);

      // JSON変換
      const msg = JSON.parse(msgBody.toString());

      console.log("✅ Message reçu :", msg);
    }
  });

  socket.on("end", () => console.log("❌ Client disconnected"));
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
