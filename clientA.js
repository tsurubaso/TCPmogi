// client.js
// ==========================================
// 📌 TCP Client minimal (Node.js)
// ==========================================

const net = require("net"); // Node.js標準のTCPライブラリ

// ==========================================
// 1) Connexion au serveur
// ==========================================
// net.createConnection() crée un client TCP.
//
// host: "127.0.0.1" signifie :
// → connexion à ton propre PC (localhost)
//
// port: 5000 signifie :
// → le serveur écoute sur ce port

const client = net.createConnection(
  { port: 5000, host: "127.0.0.1" },
  () => {
    console.log("✅ Connected to server!");

    // ==========================================
    // 2) Envoyer des données
    // ==========================================
    // client.write() envoie des bytes dans le flux TCP.
    //
    // ⚠️ Attention :
    // TCP ne garantit pas que le serveur recevra ça
    // en un seul morceau.

    client.write("Hello TCP Server!");
  }
);

// ==========================================
// 3) Réception de données venant du serveur
// ==========================================
// "data" est déclenché quand le serveur envoie quelque chose.
//
// Ici, "data" est un chunk (morceau) du flux.

client.on("data", (data) => {
  console.log("📩 Server says:", data.toString());
});

// ==========================================
// 4) Exemple important : plusieurs writes
// ==========================================
// Ici on envoie 3 fois de suite.
//
// ⚠️ TCP peut regrouper tout ça.
// Le serveur peut recevoir :
// "Part1-Part2-Part3"
// en une seule fois.
//
// Ou bien en plusieurs chunks.
// C’est imprévisible.

client.write("Part1-");
client.write("Part2-");
client.write("Part3");

// ==========================================
// 5) Fin de connexion
// ==========================================
// "end" signifie que la connexion est fermée proprement.

client.on("end", () => {
  console.log("🔚 Connection closed");
});
