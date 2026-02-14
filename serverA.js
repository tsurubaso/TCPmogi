// server.js
// ==========================================
// 📌 TCP Server minimal (Node.js)
// ==========================================

const net = require("net"); // Node.js標準のTCPライブラリ

// ==========================================
// 1) Création du serveur TCP
// ==========================================
// net.createServer() crée un serveur qui attend des connexions.
// Chaque fois qu’un client se connecte,
// la fonction (socket) => {...} est appelée.

const server = net.createServer((socket) => {
  console.log("✅ Client connected!");

  // socket = connexion directe avec CE client
  // On peut lire et écrire sur ce socket.

  // ==========================================
  // 2) Réception de données
  // ==========================================
  // TCP envoie un flux d’octets.
  // Ici, "chunk" est un morceau du flux reçu.
  //
  // ⚠️ Important :
  // Un chunk ≠ un message complet.
  // Un message peut être coupé en plusieurs chunks.

  socket.on("data", (chunk) => {
    console.log("📩 Received raw chunk:");
    console.log(chunk.toString());

    // Ici, on affiche simplement ce qui arrive.
    // Mais si on envoie du JSON,
    // JSON.parse() peut casser si le message est incomplet.
  });

  // ==========================================
  // 3) Déconnexion du client
  // ==========================================
  // "end" signifie que le client a fermé la connexion proprement.

  socket.on("end", () => {
    console.log("❌ Client disconnected");
  });
});

// ==========================================
// 4) Lancement du serveur
// ==========================================
// server.listen(port) démarre l’écoute.
// Ici, le serveur attend des connexions sur le port 5000.

server.listen(5000, () => {
  console.log("🚀 TCP Server running on port 5000");
});
