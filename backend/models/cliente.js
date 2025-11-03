import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    rif: { type: String, required: true, unique: true, maxlength: 10 },
    direccion: { type: String, required: true },
    celular: { type: String },
    email: { type: String },
    canal: { type: String },
    isActive: { type: Boolean, default: true, index: true }, // Para soft delete
  },
  {
    timestamps: true,
  }
);
const Cliente = mongoose.model("Cliente", clienteSchema);
export default Cliente;
