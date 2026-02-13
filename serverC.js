const net = require("net");

const server = net.createServer((socket) => {
  let received = "";

  socket.on("data", (chunk) => {
    console.log("📩 Chunk received:", chunk.length);
    received += chunk.toString();

    try {
      const obj = JSON.parse(received);
      console.log("✅ JSON parsed!", obj.numbers.length);
    } catch (e) {
      console.log("⚠ JSON parse failed… waiting for more data");
    }
  });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
