// ==========================================
// 🖥️ TCP Server 
// ==========================================
//
// Objectif :
// Recevoir un JSON qui arrive en plusieurs morceaux (chunks)
// et essayer de le reconstruire.
//
// ⚠️ Attention : ceci est une étape pédagogique,
// pas encore une solution parfaite (pas de framing).
//

const net = require("net"); // Module TCP natif de Node.js

// ==========================================
// 1) Création du serveur TCP
// ==========================================
//
// net.createServer() démarre un serveur bas niveau.
//
// Chaque fois qu’un client se connecte,
// Node.js crée un objet "socket" pour cette connexion.
//
const server = net.createServer((socket) => {

  // ==========================================
  // 2) Zone de stockage temporaire
  // ==========================================
  //
  // Ici on va accumuler les morceaux reçus.
  //
  // received est une string qui va contenir progressivement :
  // chunk1 + chunk2 + chunk3 ...
  //
  // Exemple :
  // received = '{"numbers":[0,1,2'
  // puis
  // received = '{"numbers":[0,1,2,3,4,...]}'
  //
  let received = "";

  // ==========================================
  // 3) Réception des données
  // ==========================================
  //
  // ⚠️ Très important :
  // "data" ne signifie PAS "un message complet".
  //
  // Cela signifie juste :
  // → "un morceau du flux TCP vient d’arriver"
  //
  socket.on("data", (chunk) => {

    // chunk est un Buffer (des bytes)
    console.log("📩 Chunk received:", chunk.length);

    // ==========================================
    // 4) Accumulation du flux
    // ==========================================
    //
    // On transforme le chunk en string
    // puis on le colle à la suite.
    //
    // Exemple :
    // received += '{"numbers":[0,1'
    //
    received += chunk.toString();

    // ==========================================
    // 5) Tentative de parsing JSON
    // ==========================================
    //
    // On essaye de parser TOUT ce qu’on a reçu jusqu’ici.
    //
    // Si le JSON est incomplet :
    // → JSON.parse échoue → exception
    //
    // Si le JSON est complet :
    // → JSON.parse marche → on obtient un objet
    //
    try {

      // Tentative de reconstruction complète
      const obj = JSON.parse(received);

      // Si on arrive ici, c’est que le JSON est enfin complet !
      console.log("✅ JSON parsed successfully!");

      // Exemple : afficher combien de nombres ont été reçus
      console.log("   numbers length =", obj.numbers.length);

    } catch (e) {

      // ==========================================
      // 6) JSON incomplet → on attend
      // ==========================================
      //
      // Tant que received ne contient pas un JSON complet,
      // JSON.parse échoue.
      //
      // Donc on ne panique pas :
      // → on attend juste le prochain chunk.
      //
      console.log("⚠ JSON parse failed… waiting for more data");
    }
  });
});

// ==========================================
// 7) Lancement du serveur
// ==========================================
//
// Le serveur écoute sur le port 5000.
// localhost:5000
//
server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
