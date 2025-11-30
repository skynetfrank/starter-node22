import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, default: 0 },
    dctoMonto: { type: Number, default: 0 },
    dctoPorciento: { type: Number, default: 0 },
    countInStock: { type: Number, default: 0 },
    genero: { type: String, required: true },
    tipo: { type: String, required: true },
    modelo: { type: String },
    tallas: [],
  },
  {
    timestamps: true,
  }
);
const Product = mongoose.model("Product", productSchema);

export default Product;
