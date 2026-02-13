
# TCP メッセージ復元（Length Prefix + Buffer + while）

このミニREADMEでは、**TCP通信でJSONが壊れる理由**と、  
安全で堅牢なメッセージ通信プロトコルの作り方を解説します。

---

## 🎯 問題：TCPは「メッセージ」を送らない

TCPが運ぶのは **連続したバイト列（ストリーム）** です。

つまり：

- 1つのメッセージが複数のchunkに分割されて届く  
- 複数のメッセージが1つのchunkにまとめて届く  

TCPには「メッセージの境界」が存在しません。

---

## ❌ 危険な例

```js
socket.on("data", (data) => {
  const msg = JSON.parse(data.toString());
});
````

`data` がJSONの途中しか届いていない場合、`JSON.parse` は失敗します。

---

## ✅ 解決策：Length Prefix プロトコル

各メッセージを次の形で送ります：

```
[4バイトの長さ][JSON本体]
```

これにより受信側は「何バイト読めば1つのメッセージか」を確実に判断できます。

---

## 🧠 基本：バッファリング

受信したchunkをすべてバッファに貯めます：

```js
let buffer = Buffer.alloc(0);

socket.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
});
```

---

## 🔁 whileでメッセージを取り出す（核心）

```js
while (buffer.length >= 4) {

  const msgLength = buffer.readUInt32BE(0);

  if (buffer.length < 4 + msgLength) break;

  const msgBody = buffer.slice(4, 4 + msgLength);

  buffer = buffer.slice(4 + msgLength);

  const msg = JSON.parse(msgBody.toString());

  console.log("✅ メッセージ受信:", msg);
}
```

---

## 🚀 完全な例

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

## ✅ 結果

サーバーは正しく受信できます：

* 複数メッセージが連続で届いてもOK
* TCPが分割しても結合してもOK

---

## 🌍 なぜ重要か？

この仕組みは次の分野で使われています：

* Blockchain P2Pノード通信
* マルチプレイヤーゲーム
* 独自ネットワークプロトコル
* 分散同期システム

---

## 📌 まとめ

* TCP = ストリーム通信
* JSONは途中で切れる可能性がある
* buffer + length-prefix + while で堅牢な通信ができる


