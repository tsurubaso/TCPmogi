// ==========================================
// 🖥️ TCP Server — Réception JSON propre (Length Prefix)
// ==========================================
//
// 🎯 Objectif :
// Recevoir correctement des messages JSON sur TCP.
//
// ⚠️ Problème : TCP n’envoie PAS des messages.
// TCP envoie seulement un flux de bytes.
//
// Donc :
// - Un JSON peut arriver en plusieurs morceaux
// - Plusieurs JSON peuvent arriver collés
//
// ✅ Solution classique : Length Prefix Protocol
//
// Format envoyé par le client :
//
//   [4 bytes longueur][JSON payload]
//
// Le serveur doit donc :
// 1) accumuler dans un buffer
// 2) lire la taille
// 3) attendre le message complet
// 4) parser
// 5) recommencer
//

const net = require("net");

// ==========================================
// 1) Création du serveur TCP
// ==========================================
//
// Chaque client qui se connecte crée un socket.
//
const server = net.createServer((socket) => {
  console.log("✅ Client connected");

  // ==========================================
  // 2) Buffer global de réception
  // ==========================================
  //
  // TCP = stream continu
  // On reçoit des morceaux ("chunks") arbitraires.
  //
  // Donc on stocke tout ici jusqu’à avoir un message complet.
  //
  let buffer = Buffer.alloc(0);

  // ==========================================
  // 3) Réception des chunks
  // ==========================================
  //
  // Chaque événement "data" donne un morceau du flux.
  // Ce morceau peut être :
  // - un début de message
  // - un message complet
  // - plusieurs messages collés
  //
  socket.on("data", (chunk) => {

    // ------------------------------------------
    // 3.1) Ajouter ce chunk au buffer
    // ------------------------------------------
    //
    // On concatène :
    // buffer = buffer + chunk
    //
    buffer = Buffer.concat([buffer, chunk]);

    // ==========================================
    // 4) Traitement des messages complets
    // ==========================================
    //
    // Tant qu’on a au moins 4 bytes,
    // on peut lire la longueur du prochain message.
    //
    while (buffer.length >= 4) {

      // ------------------------------------------
      // 4.1) Lire la taille du message
      // ------------------------------------------
      //
      // Les 4 premiers bytes = longueur du JSON payload
      //
      const msgLength = buffer.readUInt32BE(0);

      // ------------------------------------------
      // 4.2) Vérifier si tout le message est arrivé
      // ------------------------------------------
      //
      // Message complet = 4 bytes header + payload
      //
      if (buffer.length < 4 + msgLength) {
        // Pas assez de données → on attend le prochain chunk
        break;
      }

      // ------------------------------------------
      // 4.3) Extraire exactement le JSON complet
      // ------------------------------------------
      //
      // slice(4, 4+msgLength)
      // → on saute le header, on prend seulement le payload
      //
      const jsonData = buffer
        .slice(4, 4 + msgLength)
        .toString();

      // ------------------------------------------
      // 4.4) Parser le JSON
      // ------------------------------------------
      //
      // Ici, jsonData est garanti complet !
      //
      try {
        const obj = JSON.parse(jsonData);

        console.log("✅ JSON parsed !");
        console.log("   numbers length =", obj.numbers.length);

      } catch (e) {
        console.log("❌ JSON parse failed (payload corrompu ?)");
      }

      // ------------------------------------------
      // 4.5) Supprimer le message traité du buffer
      // ------------------------------------------
      //
      // On enlève :
      // [header + payload]
      //
      buffer = buffer.slice(4 + msgLength);

      // Et le while continue :
      // → support multi-messages automatique
    }
  });

  // ==========================================
  // 5) Fin de connexion client
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
