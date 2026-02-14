const net = require("net");

const server = net.createServer((socket) => {
  console.log("Client connected");

  let buffer = Buffer.alloc(0);

  socket.on("data", (chunk) => {

    // ==========================================
    // ✅ Nouvelle notion : observer les chunks TCP
    // ==========================================
    //
    // Ici on affiche la taille exacte du morceau reçu.
    //
    // Très important : chunk.length est arbitraire.
    // TCP peut envoyer :
    // - 10 bytes
    // - 500 bytes
    // - ou même plusieurs messages collés
    //
    console.log("📩 Chunk reçu :", chunk.length, "bytes");

    // On ajoute ce morceau au buffer global
    buffer = Buffer.concat([buffer, chunk]);

    // ==========================================
    // ✅ Nouvelle notion : gestion du message incomplet
    // ==========================================
    //
    // Même si on connaît la taille attendue (msgLength),
    // il est possible que tout ne soit pas encore arrivé.
    //
    while (buffer.length >= 4) {

      // On lit la longueur annoncée du payload
      const msgLength = buffer.readUInt32BE(0);

      // ==========================================
      // ✅ Nouvelle notion : attente active ("pas encore complet")
      // ==========================================
      //
      // Si le buffer contient seulement une partie du message :
      // → on ne parse surtout pas
      // → on attend le prochain chunk TCP
      //
      if (buffer.length < 4 + msgLength) {
        console.log("⏳ Message incomplet, attente...");
        break;
      }

      // ==========================================
      // Message complet disponible → extraction
      // ==========================================
      const msgBody = buffer.slice(4, 4 + msgLength);

      // On retire du buffer le message déjà traité
      buffer = buffer.slice(4 + msgLength);

      // Maintenant seulement, JSON.parse est sûr
      const msg = JSON.parse(msgBody.toString());

      // ==========================================
      // ✅ Nouvelle notion : validation du contenu reçu
      // ==========================================
      //
      // Ici on inspecte le message reconstruit :
      // - son type
      // - la taille du payload
      //
      console.log("✅ Message complet reçu !");
      console.log("Type:", msg.type);
      console.log("Payload length:", msg.payload.length);
    }
  });
});

server.listen(5000, () => {
  console.log("🚀 Server listening on port 5000");
});
