const net = require("net");

const server = net.createServer((socket) => {
  console.log("Client connected");

  let buffer = Buffer.alloc(0);

  socket.on("data", (chunk) => {
    console.log("📩 Chunk reçu :", chunk.length, "bytes");

    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 4) {

      // ==========================================
      // ✅ Nouvelle notion : traitement multi-messages en continu
      // ==========================================
      //
      // Grâce à la boucle while :
      // - si plusieurs messages arrivent collés dans le buffer,
      //   on les extrait tous d’un coup.
      //
      // Exemple :
      // buffer = [msg1 complet][msg2 complet][début msg3]
      //
      // → le serveur traite msg1 puis msg2 immédiatement.
      //

      const msgLength = buffer.readUInt32BE(0);

      if (buffer.length < 4 + msgLength) {
        console.log("⏳ Message incomplet, attente...");
        break;
      }

      // Extraction du message complet
      const msgBody = buffer.slice(4, 4 + msgLength);

      // ==========================================
      // ✅ Nouvelle notion : buffer reste valide après extraction
      // ==========================================
      //
      // Ici on retire seulement le message traité.
      // Le reste du buffer contient potentiellement :
      // - un autre message complet
      // - ou un fragment du suivant
      //
      buffer = buffer.slice(4 + msgLength);

      const msg = JSON.parse(msgBody.toString());

      console.log("✅ Message complet reçu !");

      // ==========================================
      // ✅ Nouvelle notion : identification du message applicatif
      // ==========================================
      //
      // Maintenant on n’affiche plus seulement le payload,
      // mais aussi des champs de protocole applicatif :
      //
      // - type : nature du message (bloc, tx, etc.)
      // - id   : numéro ou identifiant logique
      //
      // C’est exactement ce qu’on ferait dans une blockchain P2P.
      //

      console.log("Type:", msg.type);
      console.log("ID:", msg.id);

      // Taille du contenu transporté
      console.log("Payload length:", msg.payload.length);

      // ==========================================
      // ✅ Nouvelle notion : séparation visuelle des messages
      // ==========================================
      //
      // Petit détail, mais très utile en debug :
      // on voit clairement où un message finit
      // et où le suivant commence.
      //
      console.log("-----------------------------");
    }
  });
});

server.listen(5000, () => {
  console.log("🚀 Server listening on port 5000");
});
