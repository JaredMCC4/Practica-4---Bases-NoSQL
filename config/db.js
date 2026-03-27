const {MongoClient} = require('mongodb');

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const nombreBase = "gestion_eventos";
let db;

async function conectarBD() {
  if (!db) {
    await client.connect();
    db = client.db(nombreBase);
    console.log(`Conexión a la base de datos '${nombreBase}' establecida.`);
  }
  return db;
}

module.exports = conectarBD;