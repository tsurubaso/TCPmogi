// server.js
// ==========================================
// 📌 TCP Server — Observation des chunks TCP
// ==========================================

const net = require("net");

// ==========================================
// 1) Création du serveur TCP
// ==========================================
// net.createServer() démarre un serveur bas niveau.
// Chaque fois qu’un client se connecte,
// Node fournit un objet socket représentant la connexion.

const server = net.createServer((socket) => {
  console.log("✅ Client connected!");

  // ==========================================
  // 2) Compteur global des octets reçus
  // ==========================================
  // totalBytes va accumuler tout ce que le client envoie.
  //
  // Cela permet de voir :
  // - combien de chunks arrivent
  // - combien d’octets au total
  // - si tout le message est bien reçu

  let totalBytes = 0;

  // ==========================================
  // 3) Réception de données (événement "data")
  // ==========================================
  // ⚠️ En TCP, "data" ne signifie PAS :
  //   "un message complet"
  //
  // Cela signifie seulement :
  //   "un morceau du flux vient d’arriver"
  //
  // Le chunk peut contenir :
  // - une partie du message
  // - plusieurs messages collés
  // - n’importe quelle taille

  socket.on("data", (chunk) => {
    // chunk.length = nombre d’octets reçus dans ce morceau
    totalBytes += chunk.length;

    console.log("📩 Chunk received!");
    console.log("   chunk size =", chunk.length, "bytes");
    console.log("   total received =", totalBytes, "bytes");
    console.log("--------------------------");
  });

  // ==========================================
  // 4) Fin de connexion (événement "end")
  // ==========================================
  // "end" veut dire :
  // le client a fermé son côté d’écriture.
  //
  // Donc on sait que plus rien n’arrivera.

  socket.on("end", () => {
    console.log("❌ Client disconnected");

    // Affichage final du total reçu
    console.log("📦 Final total =", totalBytes, "bytes");
  });
});

// ==========================================
// 5) Mise en écoute sur le port 5000
// ==========================================

server.listen(5000, () => {
  console.log("🚀 TCP Server running on port 5000");
});
