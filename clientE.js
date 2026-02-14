// ==========================================
// 🧑‍💻 TCP Client —  (Length-Prefix Protocol)
// ==========================================
//
// Objectif :
// Envoyer un message JSON de manière robuste sur TCP.
//
// Problème :
// TCP est un flux continu → il découpe / colle les données.
//
// Solution :
// On envoie toujours :
//
//   [4 bytes longueur][payload JSON]
//
// Ainsi, le serveur peut reconstruire proprement.
//

const net = require("net");

// ==========================================
// 1) Connexion au serveur TCP
// ==========================================
//
// On se connecte à localhost:5000
// (donc notre serveur tourne sur le même PC)
//
const client = net.createConnection(
  { port: 5000, host: "127.0.0.1" },
  () => {
    console.log("✅ Connected to server");

    // ==========================================
    // 2) Création d’un gros objet JSON
    // ==========================================
    //
    // numbers = [0,1,2,...,99999]
    //
    // C’est un gros payload, parfait pour tester :
    // TCP va sûrement découper en plusieurs chunks.
    //
    const bigObj = {
      numbers: Array.from({ length: 100000 }, (_, i) => i),
    };

    // ==========================================
    // 3) Conversion en string JSON
    // ==========================================
    //
    // JSON.stringify transforme l’objet JS en texte :
    //
    // {"numbers":[0,1,2,...]}
    //
    const jsonStr = JSON.stringify(bigObj);

    // ==========================================
    // 4) Conversion en Buffer (bytes)
    // ==========================================
    //
    // TCP transporte des octets, pas des strings.
    //
    // Buffer.from() convertit le texte JSON en bytes.
    //
    const jsonBuffer = Buffer.from(jsonStr);

    // ==========================================
    // 5) Création du header de longueur (4 bytes)
    // ==========================================
    //
    // On réserve exactement 4 octets :
    //
    // [00 00 00 00]
    //
    // Ce header contiendra :
    // → la taille exacte du payload JSON
    //
    const lengthBuffer = Buffer.alloc(4);

    // writeUInt32BE signifie :
    //
    // UInt32 = entier positif sur 4 bytes
    // BE     = Big Endian (byte fort en premier)
    //
    // On écrit la taille du JSON dans le header :
    //
    // Exemple :
    // jsonBuffer.length = 523456 bytes
    // header = [00 07 FC 20]
    //
    lengthBuffer.writeUInt32BE(jsonBuffer.length, 0);

    // ==========================================
    // 6) Construction du paquet final
    // ==========================================
    //
    // Paquet = header + payload
    //
    // Format final envoyé :
    //
    //   [4 bytes length][JSON payload bytes]
    //
    const packet = Buffer.concat([lengthBuffer, jsonBuffer]);

    // ==========================================
    // 7) Envoi sur TCP
    // ==========================================
    //
    // Même si TCP découpe le packet en morceaux,
    // le serveur saura reconstruire grâce au header.
    //
    console.log("📤 Sending big JSON:", jsonBuffer.length, "bytes");

    client.write(packet);

    // ==========================================
    // 8) Fermeture propre
    // ==========================================
    //
    // end() signifie :
    // "je n’envoie plus rien"
    //
    client.end();
  }
);
