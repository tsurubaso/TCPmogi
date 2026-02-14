const net = require("net");

function buildMessage(obj) {

  // ==========================================
  // ✅ Nouvelle notion : fonction "builder" de message
  // ==========================================
  //
  // Ici on sépare clairement la logique :
  // - construire un message réseau complet
  // - l’envoyer ensuite
  //
  // C’est exactement ce qu’on ferait dans un protocole P2P :
  // buildMessage() = "encoder"
  //

  const json = JSON.stringify(obj);
  const body = Buffer.from(json);

  // Header 4 bytes = taille du payload
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);

  // Message final = [header + body]
  return Buffer.concat([header, body]);
}

function sendFragmented(socket, buffer, delayStart) {

  // ==========================================
  // ✅ Nouvelle notion : fragmentation artificielle contrôlée
  // ==========================================
  //
  // Ici on découpe volontairement un message complet en morceaux.
  // Objectif : simuler le comportement réel de TCP.
  //
  // Même si on envoie "1 message logique",
  // TCP peut le transmettre en plusieurs paquets.
  //

  const part1 = buffer.slice(0, 15);
  const part2 = buffer.slice(15, 60);
  const part3 = buffer.slice(60);

  // ==========================================
  // ✅ Nouvelle notion : setTimeout pour simuler du retard réseau
  // ==========================================
  //
  // Dans un vrai réseau :
  // - les morceaux arrivent avec du délai
  // - parfois dans des chunks séparés
  //
  // Ici on reproduit ça avec des timers.
  //

  setTimeout(() => {
    socket.write(part1);
    console.log("➡️ Part1 envoyée:", part1.length);
  }, delayStart);

  setTimeout(() => {
    socket.write(part2);
    console.log("➡️ Part2 envoyée:", part2.length);
  }, delayStart + 200);

  setTimeout(() => {
    socket.write(part3);
    console.log("➡️ Part3 envoyée:", part3.length);
  }, delayStart + 400);
}

const client = net.createConnection({ port: 5000 }, () => {
  console.log("Connected!");

  // ==========================================
  // ✅ Nouvelle notion : plusieurs messages différents
  // ==========================================
  //
  // On ne teste plus un seul message,
  // mais deux messages consécutifs.
  //
  // C’est là que le while(buffer) côté serveur devient crucial.
  //

  const bigData1 = "A".repeat(2000);
  const bigData2 = "B".repeat(3000);

  // Construction du message 1
  const msg1 = buildMessage({
    type: "BIG_BLOCK",
    id: 1,
    payload: bigData1,
  });

  // Construction du message 2
  const msg2 = buildMessage({
    type: "BIG_BLOCK",
    id: 2,
    payload: bigData2,
  });

  // ==========================================
  // ✅ Nouvelle notion : enchaînement de messages fragmentés
  // ==========================================
  //
  // Ici on envoie msg1 en morceaux…
  //
  console.log("📦 Envoi message 1...");
  sendFragmented(client, msg1, 0);

  // …puis msg2 juste après.
  //
  // Important :
  // Les fragments de msg2 pourraient arriver
  // alors que msg1 n’est pas encore totalement fini.
  //
  // C’est exactement le chaos réel de TCP.
  //
  console.log("📦 Envoi message 2...");
  sendFragmented(client, msg2, 600); // commence après msg1
});
