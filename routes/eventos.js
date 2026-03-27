const express = require('express');
const conectarBD = require("../config/db");
const { ObjectId } = require("mongodb");

const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const db = await conectarBD();
      const busqueda = req.query.busqueda ? req.query.busqueda.trim() : "";
      const mensaje = req.query.mensaje || "";
      let filtro = {};

      if (busqueda) {
        filtro = {
          nombre: { $regex: busqueda, $options: "i" }
        };
      }

      const coleccionEventos = db.collection("eventos");
      const eventos = await coleccionEventos.find(filtro).sort({ fecha: 1 }).toArray();

      res.render("eventos", { eventos, busqueda, mensaje });
    } catch (error) {
      console.log("Error al obtener eventos:", error);
      res.send("Ocurrió un error al obtener los eventos. Por favor, inténtalo de nuevo más tarde.");
    }
  });

//POST DE GUARDAR
router.post("/guardar", async (req, res) => {
  try {
    const db = await conectarBD();
    const {nombre,fecha,modalidad,cupo} = req.body;

    await db.collection("eventos").insertOne({nombre,fecha,modalidad,cupo: Number(cupo)});
    res.redirect("/eventos?mensaje=guardado_exitoso");
  }catch (error) {
    console.log("Error al guardar evento:", error);
    res.send("Ocurrió un error al guardar el evento. Por favor, inténtalo de nuevo más tarde.");
  }
});

//POST DE ACTUALIZAR
router.post("/actualizar/:id", async (req, res) => {
  try{
    const db = await conectarBD();
    const id = req.params.id;
    const {nombre,fecha,modalidad,cupo} = req.body;

    await db.collection("eventos").updateOne(
      {_id: new ObjectId(id)},
      {$set: {nombre,fecha,modalidad,cupo: Number(cupo)}}
    );

    res.redirect("/eventos?mensaje=actualizacion_exitosa");
  }catch (error) {
    console.log("Error al actualizar evento:", error);
    res.send("Ocurrió un error al actualizar el evento. Por favor, inténtalo de nuevo más tarde.");
  }
});

//GET DE EDITAR
router.get("/editar/:id", async (req, res) => {
  try{
    const db = await conectarBD();
    const id=req.params.id;
    const evento = await db.collection("eventos").findOne({_id: new ObjectId(id)});

    if (!evento) {
      return res.send("El evento no fue encontrado.");
    }

    res.render("editar_evento", {evento});
  } catch (error) {
    console.log("Error al obtener evento para editar:", error);
    res.send("Ocurrió un error al obtener el evento. Por favor, inténtalo de nuevo más tarde.");
  }
});

//GET DE ELIMINAR
router.get("/eliminar/:id", async (req, res) => {
  try{
    const db = await conectarBD();
    const id = req.params.id;

    const evento = await db.collection("eventos").findOne({_id: new ObjectId(id)});

    if (!evento) {
      return res.send("El evento no fue encontrado.");
    }
    res.render("eliminar_evento", {evento});
  } catch (error) {
    console.log(error);
    res.send("Ocurrió un error al obtener el evento. Por favor, inténtalo de nuevo más tarde.");
  }
});
//POST DE ELIMINAR
router.post("/eliminar/:id", async (req, res) => {
  try{
    const db = await conectarBD();
    const id = req.params.id;
    const eventoId = new ObjectId(id);

    await db.collection("inscripciones").deleteMany({eventoId: eventoId});
    
    await db.collection("eventos").deleteOne({_id: new ObjectId(id)});
    res.redirect("/eventos?mensaje=eliminacion_exitosa");
  }catch (error) {
    console.log("Error al eliminar evento:", error);
    res.send("Ocurrió un error al eliminar el evento. Por favor, inténtalo de nuevo más tarde.");
  }
});

module.exports = router;