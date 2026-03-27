const express = require('express');
const conectarBD = require("../config/db");
const { ObjectId } = require("mongodb");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await conectarBD();
    const busqueda = req.query.busqueda ? req.query.busqueda.trim() : "";
    const mensaje = req.query.mensaje || "";
    const participantes = await db.collection("participantes").find().toArray();
    const eventos = await db.collection("eventos").find().toArray();
    const inscripciones = await db.collection("inscripciones").find().toArray();

    let inscripcionesLista = inscripciones.map(inscripcion => {
      const participante = participantes.find((p) => {
        return p._id.toString() === inscripcion.participanteId.toString();
      });
      const evento = eventos.find((e) => {
        return e._id.toString() === inscripcion.eventoId.toString();
      });

      return{
        _id: inscripcion._id,
        participanteId : inscripcion.participanteId,
        eventoId : inscripcion.eventoId,
        fecha: inscripcion.fecha,
        nombreParticipante: participante ? participante.nombre : "Participante no encontrado",
        nombreEvento: evento ? evento.nombre : "Evento no encontrado"
      };
    });

    if(busqueda!==""){
      inscripcionesLista = inscripcionesLista.filter((inscripcion) => {
        return(inscripcion.nombreParticipante.toLowerCase().includes(busqueda) ||
        inscripcion.nombreEvento.toLowerCase().includes(busqueda));
      });
    }

    res.render("inscripciones", {participantes, eventos, inscripciones: inscripcionesLista, busqueda, mensaje});
    
  } catch (error) {
    console.log("Error al obtener inscripciones:", error);
    res.send("Ocurrió un error al obtener las inscripciones. Por favor, inténtalo de nuevo más tarde.");
  }
});

//POST DE GUARDAR
router.post("/guardar", async (req, res) => {
  try{
    const db = await conectarBD();
    const {participanteId, eventoId, fecha} = req.body;

    await db.collection("inscripciones").insertOne({participanteId: new ObjectId(participanteId), eventoId: new ObjectId(eventoId), fecha});
    res.redirect("/inscripciones?mensaje=guardado_exitoso");
  } catch (error) {
    console.log("Error al guardar inscripción:", error);
    res.send("Ocurrió un error al guardar la inscripción. Por favor, inténtalo de nuevo más tarde.");
  }
});

//GET DE EDITAR
router.get("/editar/:id", async (req, res) => {
  try{
    const db = await conectarBD();
    const id = req.params.id;

    const inscripcion = await db.collection("inscripciones").findOne({_id: new ObjectId(id)});

    if (!inscripcion) {
      return res.send("La inscripción no fue encontrada.");
    }

    const participantes = await db.collection("participantes").find().toArray();
    const eventos = await db.collection("eventos").find().toArray();

    res.render("editar_inscripcion", {inscripcion, participantes, eventos});
  } catch (error) {
    console.log("Error al obtener inscripción para editar:", error);
    res.send("Ocurrió un error al obtener la inscripción para editar. Por favor, inténtalo de nuevo más tarde.");
  }
});

//POST DE ACTUALIZAR
router.post("/actualizar/:id", async (req, res) => {
  try{
    const db = await conectarBD();
    const id = req.params.id;
    const {participanteId, eventoId, fecha} = req.body;

    await db.collection("inscripciones").updateOne(
      {_id: new ObjectId(id)},
      {$set: {participanteId: new ObjectId(participanteId), eventoId: new ObjectId(eventoId), fecha}}
    );
    
    res.redirect("/inscripciones?mensaje=actualizacion_exitosa");
  }catch (error) {
    console.log("Error al actualizar inscripción:", error);
    res.send("Ocurrió un error al actualizar la inscripción. Por favor, inténtalo de nuevo más tarde.");
  }
});

//GET DE ELIMANAR
router.get("/eliminar/:id", async (req, res) => {
  try{
    const db = await conectarBD();
    const id = req.params.id;

    const inscripcion = await db.collection("inscripciones").findOne({_id: new ObjectId(id)});
    if (!inscripcion) {
      return res.send("La inscripción no fue encontrada.");
    }

    const participante = await db.collection("participantes").findOne({_id: new ObjectId(inscripcion.participanteId)});
    const evento = await db.collection("eventos").findOne({_id: new ObjectId(inscripcion.eventoId)});

    res.render("eliminar_inscripcion", {inscripcion, participante, evento});

  } catch (error) {
    console.log(error);
    res.send("Ocurrió un error al obtener la inscripción. Por favor, inténtalo de nuevo más tarde.");
  }
});

//POST DE ELIMINAR
router.post("/eliminar/:id", async (req, res) => {
  try{
    const db = await conectarBD();
    const id = req.params.id;

    await db.collection("inscripciones").deleteOne({_id: new ObjectId(id)});
    res.redirect("/inscripciones?mensaje=eliminacion_exitosa");
  } catch (error) {
    console.log("Error al eliminar inscripción:", error);
    res.send("Ocurrió un error al eliminar la inscripción. Por favor, inténtalo de nuevo más tarde.");
  }
});

module.exports = router;