// client.js
const net = require("net");

// サーバーに接続する
const client = net.createConnection(
  { port: 5000, host: "127.0.0.1" },
  () => {
    console.log("✅ Connected to server!");

    // データを送る
    client.write("Hello TCP Server!");
  }
);

// サーバーから返事を受け取る
client.on("data", (data) => {
  console.log("📩 Server says:", data.toString());
});

client.write("Part1-");
client.write("Part2-");
client.write("Part3");

// 接続終了
client.on("end", () => {
  console.log("🔚 Connection closed");
});
