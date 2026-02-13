// client.js
const net = require("net");
const client = net.createConnection({ port: 5000, host: "127.0.0.1" }, () => {
  console.log("✅ Connected");

  // 長めのJSONを作る
  const bigObj = {
    numbers: Array.from({ length: 10000 }, (_, i) => i)
  };

  const jsonStr = JSON.stringify(bigObj);

  // 一気に送るのではなく、分割して送ってみる
  const half = Math.floor(jsonStr.length / 2);
  client.write(jsonStr.slice(0, half));
  client.write(jsonStr.slice(half));

  client.end();
});
