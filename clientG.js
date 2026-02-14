const net = require("net");

// ==========================================
// ✅ Nouvelle notion : fragmentation volontaire
// ==========================================
//
// Ici on ne fait plus confiance à "socket.write(message)".
//
// On simule exactement ce que TCP peut faire dans la vraie vie :
// → découper un message en plusieurs morceaux (chunks)
// → les envoyer séparément
//
function sendFragmented(socket, obj) {
  // JSON → Buffer (payload)
  const json = JSON.stringify(obj);
  const body = Buffer.from(json);

  // Header 4 bytes = longueur du payload
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);

  // ==========================================
  // ✅ Message complet : header + payload
  // ==========================================
  //
  // Normalement on enverrait ça d’un coup,
  // mais ici on va le casser en morceaux.
  //
  const fullMessage = Buffer.concat([header, body]);

  console.log("📦 Message total :", fullMessage.length, "bytes");

  // ==========================================
  // ✅ Nouvelle notion : Buffer.slice()
  // ==========================================
  //
  // slice(start, end) extrait une portion du buffer.
  //
  // Ici on découpe volontairement en 3 morceaux arbitraires.
  // (comme TCP pourrait le faire naturellement)
  //
  const part1 = fullMessage.slice(0, 10);
  const part2 = fullMessage.slice(10, 50);
  const part3 = fullMessage.slice(50);

  // ==========================================
  // ✅ Envoi morceau par morceau
  // ==========================================
  //
  // Chaque socket.write envoie un chunk indépendant.
  // Le serveur devra reconstruire le message complet.
  //
  socket.write(part1);
  console.log("➡️ Part1 envoyée:", part1.length);

  // ==========================================
  // ✅ Nouvelle notion : setTimeout()
  // ==========================================
  //
  // On ajoute un délai artificiel,
  // pour simuler un réseau réel :
  // chunks espacés dans le temps, pas instantanés.
  //
  setTimeout(() => {
    socket.write(part2);
    console.log("➡️ Part2 envoyée:", part2.length);
  }, 200);

  setTimeout(() => {
    socket.write(part3);
    console.log("➡️ Part3 envoyée:", part3.length);
  }, 400);
}

// ==========================================
// Client TCP classique
// ==========================================
const client = net.createConnection({ port: 5000 }, () => {
  console.log("Connected to server!");

  // ==========================================
  // ✅ Nouvelle notion : gros payload
  // ==========================================
  //
  // On crée volontairement un contenu long,
  // pour rendre la fragmentation visible.
  //
  const bigData = "A".repeat(2000);

  sendFragmented(client, {
    type: "BIG_BLOCK",
    payload: bigData,
  });
});
