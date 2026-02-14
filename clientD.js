// ==========================================
// 🧑‍💻 TCP Client — (Length-Prefix Protocol)
// ==========================================
//
// Objectif :
// Envoyer un message JSON de façon robuste sur TCP.
//
// ✅ On ajoute un header de 4 bytes au début
//    qui contient la taille du message.
//
// Format envoyé :
//
//   [4 bytes longueur][payload JSON]
//
// Ainsi, le serveur saura exactement :
// - combien d’octets attendre
// - où finit le message
//

const net = require("net");

// ==========================================
// 1) Connexion au serveur TCP
// ==========================================
//
// On se connecte à localhost:5000
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
    // Très gros message → parfait pour tester TCP.
    //
    const bigObj = {
      numbers: Array.from({ length: 100000 }, (_, i) => i),
    };

    // ==========================================
    // 3) Conversion en string JSON
    // ==========================================
    //
    // On transforme l’objet JS en texte JSON.
    //
    const jsonStr = JSON.stringify(bigObj);

    // ==========================================
    // 4) Conversion en Buffer (bytes)
    // ==========================================
    //
    // ⚠️ TCP transporte des bytes, pas des strings.
    //
    // Buffer.from() convertit la string en données binaires.
    //
    const jsonBuffer = Buffer.from(jsonStr);

    // ==========================================
    // 5) Création du header de longueur (4 bytes)
    // ==========================================
    //
    // On prépare un buffer de 4 octets :
    //
    // [00 00 27 10] par exemple
    //
    // Cela stocke un entier unsigned 32 bits :
    // → taille du message en bytes
    //
    const lengthBuffer = Buffer.alloc(4);

    // writeUInt32BE signifie :
    //
    // UInt32  = entier positif sur 4 bytes
    // BE      = Big Endian (le plus gros byte en premier)
    //
    // On écrit la taille du JSON dans le header.
    //
    lengthBuffer.writeUInt32BE(jsonBuffer.length, 0);

    // ==========================================
    // 6) Construction du paquet final
    // ==========================================
    //
    // On concatène :
    //
    // header (4 bytes) + payload JSON
    //
    // Résultat :
    // [length][JSON JSON JSON...]
    //
    const packet = Buffer.concat([lengthBuffer, jsonBuffer]);

    // ==========================================
    // 7) Envoi du paquet complet
    // ==========================================
    //
    // Même si TCP découpe en chunks,
    // le serveur pourra reconstruire grâce à la longueur.
    //
    console.log("📤 Sending big JSON:", jsonBuffer.length, "bytes");

    client.write(packet);

    // ==========================================
    // 8) Fermeture propre
    // ==========================================
    //
    // end() signifie :
    // "j’ai fini d’envoyer"
    //
    client.end();
  }
);
