const net = require("net");

function send(socket, obj) {
  const json = JSON.stringify(obj);
  const body = Buffer.from(json);

  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);

  socket.write(Buffer.concat([header, body]));
}

const client = net.createConnection({ port: 5000 }, () => {
  console.log("Connected!");

  send(client, { type: "HELLO", id: 1 });
  send(client, { type: "HELLO", id: 2 });
  send(client, { type: "HELLO", id: 3 });
});
