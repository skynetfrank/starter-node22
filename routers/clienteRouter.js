import express from "express";
import expressAsyncHandler from "express-async-handler";
import Cliente from "../models/cliente.js";
import { isAdmin, isAuth } from "../utils.js";

const clienteRouter = express.Router();

// OPTIMIZADO: GET / con paginación y búsqueda
// Permite consultas como /api/clientes?page=1&limit=20&search=texto
clienteRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const searchQuery = req.query.search ? {
      $or: [
        { nombre: { $regex: req.query.search, $options: "i" } },
        { rif: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    } : {};

    const clientes = await Cliente.find(searchQuery).skip((page - 1) * limit).limit(limit).sort({ nombre: 1 });
    const totalClientes = await Cliente.countDocuments(searchQuery);
    res.send({ clientes, total: totalClientes, page, pages: Math.ceil(totalClientes / limit) });
  })
);

clienteRouter.get(
  "/rif/:rif",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const cliente = await Cliente.findOne({ rif: req.params.rif });
    if (cliente) {
      res.send(cliente);
    } else {
      res.status(404).send({ message: "Cliente No Existe" });
    }
  })
);

clienteRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const cliente = await Cliente.findById(req.params.id);
    if (cliente) {
      res.send(cliente);
    } else {
      res.status(404).send({ message: "Cliente No Existe" });
    }
  })
);

clienteRouter.post(
  "/register",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // MEJORA: Validar si el RIF ya existe para dar una respuesta clara.
    const rifExists = await Cliente.findOne({ rif: req.body.rif });
    if (rifExists) {
      return res.status(400).send({ message: "El RIF ingresado ya está registrado." });
    }

    // MEJORA: Nomenclatura consistente (cliente en lugar de empleado)
    // MEJORA: Se elimina `timestamp` ya que Mongoose lo maneja automáticamente.
    const cliente = new Cliente({
      nombre: req.body.nombre,
      rif: req.body.rif,
      email: req.body.email,
      celular: req.body.celular,
      direccion: req.body.direccion,
      canal: req.body.canal,
    });

    const createdCliente = await cliente.save();
    // MEJORA: Enviar un status 201 (Created) y el objeto completo.
    res.status(201).send(createdCliente);
  })
);

// OPTIMIZADO: PUT /:id con asignación segura y validación de RIF único
clienteRouter.put(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const cliente = await Cliente.findById(req.params.id);
    if (cliente) {
      // MEJORA: Validar que el nuevo RIF no esté en uso por otro cliente.
      if (req.body.rif && req.body.rif !== cliente.rif) {
        const rifExists = await Cliente.findOne({ rif: req.body.rif });
        if (rifExists) {
          return res.status(400).send({ message: "El RIF ingresado ya pertenece a otro cliente." });
        }
      }

      // MEJORA: Asignación segura con el operador de anulación de nulos (??).
      // Permite actualizar campos a valores como "" (cadena vacía).
      cliente.nombre = req.body.nombre ?? cliente.nombre;
      cliente.rif = req.body.rif ?? cliente.rif;
      cliente.email = req.body.email ?? cliente.email;
      cliente.celular = req.body.celular ?? cliente.celular;
      cliente.direccion = req.body.direccion ?? cliente.direccion;
      cliente.canal = req.body.canal ?? cliente.canal;

      const updatedCliente = await cliente.save();
      res.send(updatedCliente);
    } else {
      res.status(404).send({ message: "Cliente No Encontrado" });
    }
  })
);

// OPTIMIZADO: DELETE /:id para usar eliminación lógica (soft delete)
clienteRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const cliente = await Cliente.findById(req.params.id);
    if (cliente) {
      // MEJORA: Implementación de Soft Delete.
      cliente.isActive = false;
      const deactivatedCliente = await cliente.save();
      res.send({ message: "Cliente desactivado correctamente", cliente: deactivatedCliente });
    } else {
      res.status(404).send({ message: "Cliente No Encontrado" });
    }
  })
);

export default clienteRouter;
