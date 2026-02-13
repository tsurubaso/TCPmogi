// server.js
const net = require("net");

const server = net.createServer((socket) => {
  console.log("✅ Client connected!");

  let totalBytes = 0;

  socket.on("data", (chunk) => {
    totalBytes += chunk.length;

    console.log("📩 Chunk received!");
    console.log("   chunk size =", chunk.length, "bytes");
    console.log("   total received =", totalBytes, "bytes");
    console.log("--------------------------");
  });

  socket.on("end", () => {
    console.log("❌ Client disconnected");
    console.log("📦 Final total =", totalBytes, "bytes");
  });
});

server.listen(5000, () => {
  console.log("🚀 TCP Server running on port 5000");
});
