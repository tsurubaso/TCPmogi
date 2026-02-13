// client.js
const net = require("net");

const client = net.createConnection(
  { port: 5000, host: "127.0.0.1" },
  () => {
    console.log("✅ Connected to server!");

    // 巨大データ（10MB）
    const bigData = "A".repeat(10 * 1024 * 1024);

    console.log("📤 Sending big data...");
    console.log("   size =", bigData.length, "bytes");

    client.write(bigData);

    console.log("✅ Done sending!");
    client.end();
  }
);
