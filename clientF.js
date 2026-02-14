const net = require("net");

// ==========================================
// ✅ Nouvelle notion : fonction send() = protocole Length-Prefix
// ==========================================
//
// Au lieu d’envoyer juste du JSON brut,
// on construit un paquet structuré :
//
//   [4 bytes longueur][payload JSON]
//
function send(socket, obj) {

  // 1) Transformer l’objet JS en texte JSON
  const json = JSON.stringify(obj);

  // 2) Convertir ce texte en bytes (Buffer)
  const body = Buffer.from(json);

  // ==========================================
  // ✅ Header = 4 bytes qui contiennent la taille du message
  // ==========================================
  //
  // On réserve exactement 4 bytes
  //
  const header = Buffer.alloc(4);

  // On écrit la longueur du payload dedans (UInt32)
  header.writeUInt32BE(body.length, 0);

  // ==========================================
  // ✅ Envoi du packet complet en une seule écriture
  // ==========================================
  //
  // TCP ne comprend pas JSON.
  // Il comprend juste une suite d’octets.
  //
  // Donc on envoie :
  // header + body
  //
  socket.write(Buffer.concat([header, body]));
}

// ==========================================
// Connexion au serveur TCP
// ==========================================
const client = net.createConnection({ port: 5000 }, () => {
  console.log("Connected!");

  // ==========================================
  // ✅ Nouvelle notion : envoyer plusieurs messages d’affilée
  // ==========================================
  //
  // Même si on fait 3 write(),
  // TCP peut les coller ou les découper.
  //
  // Mais grâce au length-prefix,
  // le serveur pourra toujours reconstruire :
  //
  send(client, { type: "HELLO", id: 1 });
  send(client, { type: "HELLO", id: 2 });
  send(client, { type: "HELLO", id: 3 });
});
