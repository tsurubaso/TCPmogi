const net = require("net");

const server = net.createServer((socket) => {
  console.log("Client connected");

  let buffer = Buffer.alloc(0);

  socket.on("data", (chunk) => {
    console.log("📩 Chunk reçu :", chunk.length, "bytes");

    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 4) {
      const msgLength = buffer.readUInt32BE(0);

      if (buffer.length < 4 + msgLength) {
        console.log("⏳ Message incomplet, attente...");
        break;
      }

      const msgBody = buffer.slice(4, 4 + msgLength);
      buffer = buffer.slice(4 + msgLength);

      const msg = JSON.parse(msgBody.toString());

      console.log("✅ Message complet reçu !");
      console.log("Type:", msg.type);
      console.log("ID:", msg.id);
      console.log("Payload length:", msg.payload.length);
      console.log("-----------------------------");
    }
  });
});

server.listen(5000, () => {
  console.log("🚀 Server listening on port 5000");
});
