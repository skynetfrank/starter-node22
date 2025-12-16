import express from "express";
import expressAsyncHandler from "express-async-handler";
import Cita from "../models/citaModel.js";
import { isAuth, isAdmin } from "../utils.js";
import User from "../models/user.js"; // Importar el modelo de usuario para validación
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
    // Añadir validación para userId si se envía (solo para admins)
    const validationRules = [
      body("fecha", "La fecha es obligatoria").not().isEmpty(),
      body("hora", "La hora es obligatoria").not().isEmpty(),
      body("userId").optional().isMongoId().withMessage("ID de usuario inválido"),
    ];

    await Promise.all(validationRules.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fecha, hora, motivo, userId } = req.body; // Ahora recibimos userId del body

    // Determinar para qué usuario se agendará la cita
    let appointmentUserId;
    if (req.user.isAdmin && userId) {
      // Si es admin y se proporciona un userId, usar ese userId
      appointmentUserId = userId;
      // Opcional: Verificar que el userId proporcionado por el admin exista
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).send({ message: "El usuario especificado no existe." });
      }
    } else if (!req.user.isAdmin && userId && userId !== req.user._id.toString()) {
      return res.status(403).send({ message: "No tienes permiso para agendar citas para otros usuarios." });
    } else {
      appointmentUserId = req.user._id; // Por defecto, el usuario logueado
    }

    // Validar que la hora no esté ya reservada para ese día
    // Normalizar la fecha para la consulta, igual que en la ruta de disponibilidad
    const fechaDate = new Date(fecha); // fecha es YYYY-MM-DD
    const startOfDay = new Date(new Date(fechaDate).setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(fechaDate).setUTCHours(23, 59, 59, 999));

    const citaExistente = await Cita.findOne({
      fecha: { $gte: startOfDay, $lte: endOfDay },
      hora: hora,
    });

    if (citaExistente) {
      return res.status(400).send({ message: "La hora seleccionada ya no está disponible." });
    }

    const nuevaCita = new Cita({
      user: appointmentUserId, // Usamos el ID de usuario determinado
      fecha: startOfDay, // La fecha ya está normalizada al inicio del día
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
