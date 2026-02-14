// ==========================================
// 🧑‍💻 TCP Client 
// ==========================================
//
// Objectif :
// Envoyer un gros JSON au serveur,
// mais volontairement en plusieurs morceaux.
//
// Cela permet de démontrer que :
// ❌ TCP n’envoie pas des "messages complets"
// ✅ TCP envoie un flux découpé arbitrairement
//

const net = require("net"); // Module TCP natif de Node.js

// ==========================================
// 1) Connexion au serveur
// ==========================================
//
// net.createConnection() ouvre une connexion TCP.
//
// host: "127.0.0.1"
// → signifie "mon propre ordinateur" (localhost)
//
// port: 5000
// → le serveur écoute sur ce port
//
const client = net.createConnection(
  { port: 5000, host: "127.0.0.1" },
  () => {
    console.log("✅ Connected");

    // ==========================================
    // 2) Création d’un gros objet JSON
    // ==========================================
    //
    // Ici on fabrique un objet contenant :
    // numbers = [0,1,2,...,9999]
    //
    // Pourquoi ?
    // → pour obtenir un JSON très long
    // → donc intéressant à découper
    //
    const bigObj = {
      numbers: Array.from({ length: 10000 }, (_, i) => i),
    };

    // ==========================================
    // 3) Conversion en string JSON
    // ==========================================
    //
    // JSON.stringify transforme l’objet JS en texte.
    //
    // Exemple :
    // {"numbers":[0,1,2,3,4,...]}
    //
    const jsonStr = JSON.stringify(bigObj);

    console.log("📦 JSON size =", jsonStr.length, "characters");

    // ==========================================
    // 4) Découpage volontaire du message
    // ==========================================
    //
    // Ici, on simule exactement ce que TCP peut faire :
    //
    // → envoyer un message en plusieurs chunks
    //
    // On coupe le JSON en deux parties :
    //
    // chunk1 = première moitié
    // chunk2 = deuxième moitié
    //
    const half = Math.floor(jsonStr.length / 2);

    // ==========================================
    // 5) Envoi du premier morceau
    // ==========================================
    //
    // ⚠️ Le serveur reçoit seulement une partie du JSON.
    //
    // Exemple reçu :
    // {"numbers":[0,1,2,3,4,...
    //
    client.write(jsonStr.slice(0, half));

    console.log("📤 Sent first half...");

    // ==========================================
    // 6) Envoi du deuxième morceau
    // ==========================================
    //
    // Le serveur reçoit la fin :
    // ...,9997,9998,9999]}
    //
    client.write(jsonStr.slice(half));

    console.log("📤 Sent second half...");

    // ==========================================
    // 7) Fermeture de connexion
    // ==========================================
    //
    // client.end() signifie :
    // → "je n’envoie plus rien"
    //
    // Le serveur va recevoir l’événement "end".
    //
    client.end();

    console.log("🔚 Connection ended");
  }
);
