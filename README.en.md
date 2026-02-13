
# TCP Message Framing (Length-Prefix + Buffer + while)

This mini-README explains **why JSON breaks over TCP** and how to build a robust messaging protocol.

---

## 🎯 Problem: TCP does not send “messages”

TCP transports a **continuous stream of bytes**.

That means:

- A single message can arrive in multiple chunks  
- Multiple messages can arrive glued together in one chunk  

TCP has no built-in message boundaries.

---

## ❌ Dangerous Example

```js
socket.on("data", (data) => {
  const msg = JSON.parse(data.toString());
});
```

This will break if `data` contains an incomplete JSON fragment.

---

## ✅ Solution: Length-Prefix Protocol

Each message is encoded like this:

```
[4 bytes length][JSON payload]
```

So the receiver always knows how many bytes belong to the full message.

---

## 🧠 Principle: Buffering

We accumulate all incoming chunks into a buffer:

```js
let buffer = Buffer.alloc(0);

socket.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
});
```

---

## 🔁 Extracting Messages with while (the core idea)

```js
while (buffer.length >= 4) {

  const msgLength = buffer.readUInt32BE(0);

  if (buffer.length < 4 + msgLength) break;

  const msgBody = buffer.slice(4, 4 + msgLength);

  buffer = buffer.slice(4 + msgLength);

  const msg = JSON.parse(msgBody.toString());

  console.log("✅ Message received:", msg);
}
```

---

## 🚀 Full Example

### server.js

```js
const net = require("net");

net.createServer((socket) => {

  let buffer = Buffer.alloc(0);

  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 4) {
      const len = buffer.readUInt32BE(0);

      if (buffer.length < 4 + len) break;

      const body = buffer.slice(4, 4 + len);
      buffer = buffer.slice(4 + len);

      console.log("Message:", JSON.parse(body.toString()));
    }
  });

}).listen(5000);
```

---

### client.js

```js
const net = require("net");

function send(socket, obj) {
  const json = JSON.stringify(obj);
  const body = Buffer.from(json);

  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);

  socket.write(Buffer.concat([header, body]));
}

const client = net.createConnection({ port: 5000 }, () => {
  send(client, { type: "HELLO", id: 1 });
  send(client, { type: "HELLO", id: 2 });
});
```

---

## ✅ Result

The server correctly receives:

* multiple messages
* even if TCP splits them or merges them together

---

## 🌍 Why It Matters

This technique is widely used in:

* Blockchain P2P nodes
* Multiplayer games
* Custom network protocols
* Distributed synchronization systems

---

## 📌 Conclusion

* TCP = byte stream
* JSON can be split across packets
* buffer + length-prefix + while = robust messaging

