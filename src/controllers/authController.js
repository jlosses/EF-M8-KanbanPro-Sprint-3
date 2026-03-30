const Usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Controlador para el registro de usuarios
const registro = async (req, res) => {
  try {
    const { email, password, nombre } = req.body;

    // Verificar que los datos existan
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos" });
    }
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      email,
      password: hashedPassword,
      nombre,
    });

    // Generar un token JWT
    const token = jwt.sign(
      { id: nuevoUsuario.id, email: nuevoUsuario.email },
      process.env.JWT_SECRET || "clave_secreta",
      { expiresIn: "1h" },
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
      },
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    return res.status(500).json({ message: "Error al registrar el usuario." });
  }
};

// Login

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Verificar que los datos existan
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos" });
    }

    // Buscar el usuario en la BD
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        error: "Email o contraseña incorrectos.",
      });
    }

    // Comparar la contraseña ingresada con la hasheada
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({
        error: "Email o contraseña incorrectos.",
      });
    }

    // Crear un JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || "tu_clave_secreta",
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      mensaje: "Login exitoso.",
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      error: "Error al iniciar sesión.",
    });
  }
};

module.exports = { registro, login };
