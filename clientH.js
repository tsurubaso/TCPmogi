const net = require("net");

function buildMessage(obj) {
  const json = JSON.stringify(obj);
  const body = Buffer.from(json);

  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);

  return Buffer.concat([header, body]);
}

function sendFragmented(socket, buffer, delayStart) {
  const part1 = buffer.slice(0, 15);
  const part2 = buffer.slice(15, 60);
  const part3 = buffer.slice(60);

  setTimeout(() => {
    socket.write(part1);
    console.log("➡️ Part1 envoyée:", part1.length);
  }, delayStart);

  setTimeout(() => {
    socket.write(part2);
    console.log("➡️ Part2 envoyée:", part2.length);
  }, delayStart + 200);

  setTimeout(() => {
    socket.write(part3);
    console.log("➡️ Part3 envoyée:", part3.length);
  }, delayStart + 400);
}

const client = net.createConnection({ port: 5000 }, () => {
  console.log("Connected!");

  const bigData1 = "A".repeat(2000);
  const bigData2 = "B".repeat(3000);

  const msg1 = buildMessage({
    type: "BIG_BLOCK",
    id: 1,
    payload: bigData1,
  });

  const msg2 = buildMessage({
    type: "BIG_BLOCK",
    id: 2,
    payload: bigData2,
  });

  console.log("📦 Envoi message 1...");
  sendFragmented(client, msg1, 0);

  console.log("📦 Envoi message 2...");
  sendFragmented(client, msg2, 600); // commence après msg1
});
