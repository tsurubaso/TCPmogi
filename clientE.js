const net = require("net");

const client = net.createConnection({ port: 5000, host: "127.0.0.1" }, () => {
  console.log("✅ Connected to server");

  // 大きなJSONを作成
  const bigObj = { numbers: Array.from({ length: 100000 }, (_, i) => i) };
  const jsonStr = JSON.stringify(bigObj);
  const jsonBuffer = Buffer.from(jsonStr);

  // 長さ（4バイト）を先頭に追加
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(jsonBuffer.length, 0);

  // 長さ + JSON 本体をまとめて送信
  const packet = Buffer.concat([lengthBuffer, jsonBuffer]);

  console.log("📤 Sending big JSON:", jsonBuffer.length, "bytes");
  client.write(packet);

  client.end();
});
