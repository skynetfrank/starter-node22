import mongoose from "mongoose";

const citaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fecha: { type: Date, required: true },
    // Almacenamos la hora como string "HH:mm" para simplicidad en el frontend
    hora: { type: String, required: true },
    // Nuevo campo para el motivo o notas de la cita
    motivo: { type: String, required: false, default: "" },
  },
  {
    timestamps: true,
  }
);

const Cita = mongoose.model("Cita", citaSchema);
export default Cita;
