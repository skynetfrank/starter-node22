import mongoose from "mongoose";

const horarioSchema = new mongoose.Schema(
  {
    horaInicio: { type: Number, required: true, min: 0, max: 23 }, // 8 para 8:00 AM
    horaFin: { type: Number, required: true, min: 0, max: 23 }, // 22 para 10:00 PM
    duracionCita: { type: Number, required: true, default: 60 }, // Duración en minutos
  },
  {
    timestamps: true,
  }
);

const Horario = mongoose.model("Horario", horarioSchema);

export default Horario;
