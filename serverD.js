const net = require("net");

// TCPサーバー
const server = net.createServer((socket) => {
  console.log("✅ Client connected");

  let buffer = Buffer.alloc(0); // 受信バッファ

  socket.on("data", (chunk) => {
    // 受信したデータをバッファに追加
    buffer = Buffer.concat([buffer, chunk]);

    // バッファに長さ情報があれば処理
    while (buffer.length >= 4) { // 長さは4バイトで固定
      const msgLength = buffer.readUInt32BE(0); // 最初の4バイトを読む

      if (buffer.length >= 4 + msgLength) {
        // JSON本体を取り出す
        const jsonData = buffer.slice(4, 4 + msgLength).toString();
        try {
          const obj = JSON.parse(jsonData);
          console.log("✅ JSON parsed!", obj.numbers.length);
        } catch (e) {
          console.log("❌ JSON parse failed");
        }

        // バッファから処理済み部分を削除
        buffer = buffer.slice(4 + msgLength);
      } else {
        // まだデータが全部届いていない
        break;
      }
    }
  });

  socket.on("end", () => console.log("❌ Client disconnected"));
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
