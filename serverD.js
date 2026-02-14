// ==========================================
// 🖥️ TCP Server — (Length-Prefix + Buffer + while)
// ==========================================
//
// Objectif :
// Recevoir des messages JSON correctement sur TCP,
// même si TCP découpe ou colle les chunks.
//
// Protocole utilisé :
//
//   [4 bytes longueur][payload JSON]
//
// Le serveur doit donc :
// 1) accumuler dans un buffer
// 2) lire la longueur
// 3) attendre le message complet
// 4) extraire
// 5) recommencer (while)
//
// C’est exactement ce qu’on fait dans un réseau blockchain P2P.
//

const net = require("net");

// ==========================================
// 1) Création du serveur TCP
// ==========================================
//
// Chaque connexion client crée un socket.
//
const server = net.createServer((socket) => {
  console.log("✅ Client connected");

  // ==========================================
  // 2) Buffer de réception global
  // ==========================================
  //
  // TCP envoie un flux continu.
  //
  // Donc on stocke tout ce qui arrive ici,
  // jusqu’à pouvoir reconstruire un message complet.
  //
  // Au début, buffer est vide :
  //
  // buffer = < >
  //
  let buffer = Buffer.alloc(0);

  // ==========================================
  // 3) Réception des chunks TCP
  // ==========================================
  //
  // "data" = un morceau arbitraire du flux.
  //
  socket.on("data", (chunk) => {

    // ------------------------------------------
    // 3.1) Ajouter le chunk au buffer
    // ------------------------------------------
    //
    // On concatène :
    //
    // buffer = buffer + chunk
    //
    buffer = Buffer.concat([buffer, chunk]);

    // ==========================================
    // 4) Extraction des messages complets
    // ==========================================
    //
    // Tant qu’on a au moins 4 bytes,
    // on peut lire la taille du prochain message.
    //
    // Pourquoi 4 bytes ?
    //
    // Parce que le client envoie :
    // [UInt32 length][JSON payload]
    //
    while (buffer.length >= 4) {

      // ------------------------------------------
      // 4.1) Lire la longueur du message
      // ------------------------------------------
      //
      // readUInt32BE(0) lit un entier 32 bits
      // à partir de l’offset 0 (début du buffer).
      //
      // Exemple :
      // buffer = [00 00 01 F4 ...]
      // msgLength = 500 bytes
      //
      const msgLength = buffer.readUInt32BE(0);

      // ------------------------------------------
      // 4.2) Vérifier si le message complet est arrivé
      // ------------------------------------------
      //
      // Message complet = header (4 bytes) + payload (msgLength bytes)
      //
      // Si on n’a pas encore tout reçu :
      // → on sort du while et on attend le prochain chunk.
      //
      if (buffer.length < 4 + msgLength) {
        break;
      }

      // ------------------------------------------
      // 4.3) Extraire le payload JSON complet
      // ------------------------------------------
      //
      // buffer.slice(4, 4+msgLength)
      //
      // On saute les 4 bytes du header,
      // et on prend exactement msgLength bytes.
      //
      const jsonData = buffer
        .slice(4, 4 + msgLength)
        .toString();

      // ------------------------------------------
      // 4.4) Parser le JSON
      // ------------------------------------------
      //
      // Maintenant c’est garanti :
      // jsonData contient un JSON complet.
      //
      try {
        const obj = JSON.parse(jsonData);

        console.log("✅ JSON parsed successfully!");
        console.log("   numbers length =", obj.numbers.length);

      } catch (e) {
        console.log("❌ JSON parse failed (corrupted payload?)");
      }

      // ------------------------------------------
      // 4.5) Supprimer le message traité du buffer
      // ------------------------------------------
      //
      // On enlève :
      // [header + payload]
      //
      // Il reste peut-être :
      // - un autre message complet
      // - un morceau incomplet du suivant
      //
      buffer = buffer.slice(4 + msgLength);

      // Et le while continue :
      // → multi messages supportés !
    }
  });

  // ==========================================
  // 5) Fin de connexion
  // ==========================================
  socket.on("end", () => {
    console.log("❌ Client disconnected");
  });
});

// ==========================================
// 6) Serveur en écoute
// ==========================================
server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
