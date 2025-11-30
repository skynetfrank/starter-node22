import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    cedula: { type: String, required: false, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    telefono: { type: String },
    isAdmin: { type: Boolean, default: false, required: true },
    isVendedor: { type: Boolean, default: false, required: true },
    isActive: { type: Boolean, default: true, index: true }, // Campo para borrado lógico
    isProtected: { type: Boolean, default: false }, // Campo para proteger usuarios críticos
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
export default User;
