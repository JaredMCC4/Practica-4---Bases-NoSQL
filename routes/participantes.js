const express = require('express');
const {ObjectId} = require('mongodb');
const conectarBD = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await conectarBD();
    const busqueda = req.query.busqueda ? req.query.busqueda.trim() : "";
    const mensaje = req.query.mensaje || "";
    let filtro = {};

    if (busqueda !== "") {
      filtro.nombre = { $regex: busqueda, $options: "i" };
    }

    const participantes = await db.collection("participantes").find(filtro).toArray();
    res.render("participantes", { participantes, busqueda, mensaje });
  } catch (error) {
    console.log("Error al obtener participantes:", error);
    res.send("Ocurrió un error al obtener los participantes. Por favor, inténtalo de nuevo más tarde.");
  }
});

//POST DE GUARDAR
router.post("/guardar", async (req, res) => {
  try{
    const db = await conectarBD();
    const {nombre,correo,telefono} = req.body;

    await db.collection("participantes").insertOne({nombre,correo,telefono});
    res.redirect("/participantes?mensaje=guardado_exitoso");
  }catch (error) {
    console.log("Error al guardar participante:", error);
    res.send("Ocurrió un error al guardar el participante. Por favor, inténtalo de nuevo más tarde.");
  }
});

//GET DE EDITAR
router.get("/editar/:id", async (req, res) => {
  try{
    const db = await conectarBD();
    const id=req.params.id;

    const participante = await db.collection("participantes").findOne({_id: new ObjectId(id)});

    if (!participante) {
      return res.send("El participante no fue encontrado.");
  }
    res.render("editar_participante", {participante});
  } catch (error) {
    console.log("Error al editar participante:", error);
    res.send("Ocurrió un error al obtener el participante para editar. Por favor, inténtalo de nuevo más tarde.");
  }
});

//POST DE ACTUALIZAR
router.post("/actualizar/:id", async (req, res) => {
  try{
    const db = await conectarBD();
    const id = req.params.id;
    const {nombre,correo,telefono} = req.body;

    await db.collection("participantes").updateOne({_id: new ObjectId(id)}, {$set:{nombre,correo,telefono}});
    res.redirect("/participantes?mensaje=actualizacion_exitosa");
  } catch (error) {
    console.log("Error al actualizar participante:", error);
    res.send("Ocurrió un error al actualizar el participante. Por favor, inténtalo de nuevo más tarde.");
  }
});

//GET DE ELIMINAR
router.get("/eliminar/:id", async (req, res) => {
  try{
    const db = await conectarBD();
    const id = req.params.id;

    const participante = await db.collection("participantes").findOne({_id: new ObjectId(id)});
    if (!participante) {
      return res.send("El participante no fue encontrado.");
  }
  res.render("eliminar_participante", {participante});
  } catch (error) {
    console.log(error);
    res.send("Ocurrió un error al cargar la pagina de eliminacion. Por favor, inténtalo de nuevo más tarde.");
  }
});
//POST DE ELIMINAR
router.post("/eliminar/:id", async (req, res) => {
  try{
    const db = await conectarBD();
    const id = req.params.id;
    const participanteId = new ObjectId(id);
    
    await db.collection("inscripciones").deleteMany({participanteId:participanteId});
    await db.collection("participantes").deleteOne({_id: new ObjectId(id)});
    res.redirect("/participantes?mensaje=eliminacion_exitosa");
  } catch (error) {
    console.log("Error al eliminar participante:", error);
    res.send("Ocurrió un error al eliminar el participante. Por favor, inténtalo de nuevo más tarde.");
  }
});

module.exports = router;