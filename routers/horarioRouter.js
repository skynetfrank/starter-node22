import express from "express";
import expressAsyncHandler from "express-async-handler";
import Horario from "../models/horarioModel.js";
import { isAuth, isAdmin } from "../utils.js";

const horarioRouter = express.Router();

// GET /api/horarios - Obtener la configuración de horario
horarioRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    // Siempre habrá un solo documento de horario, o ninguno si no se ha configurado.
    const horario = await Horario.findOne();
    if (horario) {
      res.send(horario);
    } else {
      // Si no hay horario, podemos devolver un default o un 404.
      // Devolver un 404 es más explícito.
      res.status(404).send({ message: "Horario no configurado." });
    }
  })
);

// POST /api/horarios - Crear o actualizar la configuración de horario (solo admin)
horarioRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { horaInicio, horaFin, duracionCita } = req.body;

    // Usamos findOneAndUpdate con upsert:true para crear el documento si no existe,
    // o actualizarlo si ya existe. Esto asegura que solo haya un documento.
    const horario = await Horario.findOneAndUpdate(
      {},
      { horaInicio, horaFin, duracionCita },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).send({ message: "Horario actualizado correctamente.", horario });
  })
);

export default horarioRouter;
