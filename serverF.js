const net = require("net");

// ==========================================
// ✅ Nouvelle notion : serveur TCP avec framing
// ==========================================
//
// Ici le serveur ne lit plus du texte brut,
// il reconstruit des messages encadrés :
//
//   [4 bytes longueur][payload JSON]
//
const server = net.createServer((socket) => {
  console.log("✅ Client connected");

  // ==========================================
  // ✅ Buffer de réception persistant
  // ==========================================
  //
  // TCP envoie un flux continu :
  // les messages peuvent arriver coupés ou collés.
  //
  // Donc on stocke tout ici jusqu’à pouvoir lire un message complet.
  //
  let buffer = Buffer.alloc(0);

  socket.on("data", (chunk) => {

    // ==========================================
    // ✅ 1) Accumulation : ajouter le chunk au buffer
    // ==========================================
    //
    // chunk = morceau arbitraire reçu
    // buffer = tout ce qu’on a reçu jusqu’ici
    //
    buffer = Buffer.concat([buffer, chunk]);

    // ==========================================
    // ✅ 2) while : extraire "autant de messages complets que possible"
    // ==========================================
    //
    // Important :
    // un seul chunk peut contenir plusieurs messages.
    //
    while (buffer.length >= 4) {

      // ==========================================
      // ✅ Lire le header (4 bytes = taille du prochain message)
      // ==========================================
      //
      const msgLength = buffer.readUInt32BE(0);

      // ==========================================
      // ✅ Si le message complet n’est pas encore arrivé → on attend
      // ==========================================
      //
      if (buffer.length < 4 + msgLength) break;

      // ==========================================
      // ✅ Extraire le payload JSON complet
      // ==========================================
      //
      // On saute les 4 bytes du header,
      // puis on prend exactement msgLength bytes.
      //
      const msgBody = buffer.slice(4, 4 + msgLength);

      // ==========================================
      // ✅ Retirer ce message du buffer
      // ==========================================
      //
      // Il reste peut-être un autre message derrière,
      // donc le while continue.
      //
      buffer = buffer.slice(4 + msgLength);

      // ==========================================
      // ✅ Maintenant seulement : JSON.parse est sûr
      // ==========================================
      //
      const msg = JSON.parse(msgBody.toString());

      console.log("✅ Message reçu :", msg);
    }
  });

  socket.on("end", () => console.log("❌ Client disconnected"));
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
