const net = require("net");

function sendFragmented(socket, obj) {
  const json = JSON.stringify(obj);
  const body = Buffer.from(json);

  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);

  const fullMessage = Buffer.concat([header, body]);

  console.log("📦 Message total :", fullMessage.length, "bytes");

  // わざと3つに分割する
  const part1 = fullMessage.slice(0, 10);
  const part2 = fullMessage.slice(10, 50);
  const part3 = fullMessage.slice(50);

  socket.write(part1);
  console.log("➡️ Part1 envoyée:", part1.length);

  setTimeout(() => {
    socket.write(part2);
    console.log("➡️ Part2 envoyée:", part2.length);
  }, 200);

  setTimeout(() => {
    socket.write(part3);
    console.log("➡️ Part3 envoyée:", part3.length);
  }, 400);
}

const client = net.createConnection({ port: 5000 }, () => {
  console.log("Connected to server!");

  // 巨大なpayloadを作る
  const bigData = "A".repeat(2000);

  sendFragmented(client, {
    type: "BIG_BLOCK",
    payload: bigData,
  });
});
