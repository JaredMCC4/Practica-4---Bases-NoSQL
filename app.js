const conectarBD = require("./config/db");
const participantesRoute = require("./routes/participantes");
const eventosRoute = require("./routes/eventos");
const inscripcionesRoute = require("./routes/inscripciones");

const express = require('express');
const path = require('path');
const app = express();
const puerto = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use("/css", express.static(path.join(__dirname, "css")));

app.get("/", (req, res) => {
    res.render("index");
});

app.use("/participantes", participantesRoute);
app.use("/eventos", eventosRoute);
app.use("/inscripciones", inscripcionesRoute);

async function iniciarServidor() {
  try{
    await conectarBD();
    app.listen(puerto, () => {
      console.log(`El servidor esta corriendo correctamente en http://localhost:${puerto}`);
    });
  } catch (error) {
    console.error("Hay un error al iniciar el servidor:", error);
  }
}

iniciarServidor();
