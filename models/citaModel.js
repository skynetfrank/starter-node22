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
  },
  {
    timestamps: true,
  }
);

const Cita = mongoose.model("Cita", citaSchema);
export default Cita;
