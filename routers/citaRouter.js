import express from "express";
import expressAsyncHandler from "express-async-handler";
import Cita from "../models/citaModel.js";
import { isAuth, isAdmin } from "../utils.js";
import { body, validationResult } from "express-validator";

const citaRouter = express.Router();

// GET /api/citas - Obtener TODAS las citas (solo para administradores)
citaRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const citas = await Cita.find({})
      .populate("user", "nombre apellido email") // Obtiene detalles del usuario asociado
      .sort({ fecha: -1, hora: 1 }); // Ordena por fecha más reciente primero

    res.send(citas);
  })
);

// GET /api/citas/disponibilidad?fecha=YYYY-MM-DD
// Endpoint clave para obtener las horas ya ocupadas en un día específico.
citaRouter.get(
  "/disponibilidad",
  expressAsyncHandler(async (req, res) => {
    const fechaQuery = req.query.fecha;
    if (!fechaQuery) {
      return res.status(400).send({ message: "La fecha es requerida." });
    }

    // Normalizar la fecha para evitar problemas de zona horaria
    const fecha = new Date(fechaQuery);
    const startOfDay = new Date(fecha.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(fecha.setUTCHours(23, 59, 59, 999));

    const citasEnEseDia = await Cita.find({
      fecha: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const horasOcupadas = citasEnEseDia.map((cita) => cita.hora);
    res.send(horasOcupadas);
  })
);

// POST /api/citas - Crear una nueva cita
citaRouter.post(
  "/",
  isAuth,
  [body("fecha", "La fecha es obligatoria").not().isEmpty(), body("hora", "La hora es obligatoria").not().isEmpty()],
  expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fecha, hora, motivo } = req.body;

    // Validar que la hora no esté ya reservada para ese día
    const fechaObj = new Date(fecha);
    const startOfDay = new Date(new Date(fechaObj).setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(fechaObj).setUTCHours(23, 59, 59, 999));

    const citaExistente = await Cita.findOne({
      fecha: { $gte: startOfDay, $lte: endOfDay },
      hora: hora,
    });

    if (citaExistente) {
      return res.status(400).send({ message: "La hora seleccionada ya no está disponible." });
    }

    const nuevaCita = new Cita({
      user: req.user._id, // Obtenido del middleware isAuth
      fecha: startOfDay, // Guardamos la fecha normalizada
      hora,
      motivo, // Guardamos el motivo
    });

    const citaCreada = await nuevaCita.save();
    res.status(201).send({ message: "Cita creada con éxito", cita: citaCreada });
  })
);

// GET /api/citas/mias - Obtener las citas del usuario logueado
citaRouter.get(
  "/mias",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const citas = await Cita.find({ user: req.user._id }).sort({ fecha: 1, hora: 1 });
    res.send(citas);
  })
);

// DELETE /api/citas/:id - Cancelar una cita
citaRouter.delete(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const cita = await Cita.findById(req.params.id);
    if (cita) {
      // Opcional: verificar que el usuario que borra es el dueño de la cita o es admin
      if (cita.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(403).send({ message: "Acción no autorizada." });
      }
      await cita.deleteOne();
      res.send({ message: "Cita cancelada" });
    } else {
      res.status(404).send({ message: "Cita no encontrada" });
    }
  })
);

export default citaRouter;
