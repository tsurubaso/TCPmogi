// client.js
// ==========================================
// 📌 TCP Client — Envoi d’un gros flux (10MB)
// ==========================================

const net = require("net");

// ==========================================
// 1) Connexion au serveur TCP
// ==========================================
// On se connecte sur localhost (127.0.0.1)
// et sur le port 5000.

const client = net.createConnection(
  { port: 5000, host: "127.0.0.1" },
  () => {
    console.log("✅ Connected to server!");

    // ==========================================
    // 2) Création d’une énorme donnée
    // ==========================================
    // Ici on crée une string de 10 MB :
    //
    // 10 * 1024 * 1024 = 10 485 760 caractères
    //
    // ⚠️ Ce n’est pas un vrai fichier,
    // c’est juste un gros bloc de texte.
    //
    // Mais ça simule très bien :
    // - un bloc blockchain
    // - un snapshot de chaîne
    // - un gros message réseau

    const bigData = "A".repeat(10 * 1024 * 1024);

    console.log("📤 Sending big data...");
    console.log("   size =", bigData.length, "bytes");

    // ==========================================
    // 3) Envoi du flux via TCP
    // ==========================================
    // client.write() envoie la donnée dans le flux TCP.
    //
    // ⚠️ Important :
    // Cela ne veut PAS dire que le serveur recevra
    // 10MB en une seule fois.
    //
    // TCP va découper automatiquement en paquets/chunks.

    client.write(bigData);

    console.log("✅ Done sending!");

    // ==========================================
    // 4) Fermeture de connexion
    // ==========================================
    // client.end() dit :
    // "Je n’ai plus rien à envoyer."

    client.end();
  }
);
