const Tablero = require('../models/Tablero');
const Lista = require('../models/Lista');

// GET /api/tableros - Obtener todos los tableros del usuario
const obtenerTableros = async (req, res) => {
  try {
    const usuarioId = req.usuario.id; // Del middleware de autenticación

    const tableros = await Tablero.findAll({
      where: { usuarioId },
      include: {
        model: Lista,
        as: 'listas', // Asume que en tu modelo Tablero defines esta asociación
      },
    });

    return res.status(200).json(tableros);
  } catch (error) {
    console.error('Error al obtener tableros:', error);
    return res.status(500).json({
      error: 'Error al obtener tableros.',
    });
  }
};

// GET /api/tableros/:id - Obtener un tablero específico
const obtenerTablero = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const tablero = await Tablero.findOne({
      where: { id, usuarioId },
      include: {
        model: Lista,
        as: 'listas',
      },
    });

    if (!tablero) {
      return res.status(404).json({
        error: 'Tablero no encontrado.',
      });
    }

    return res.status(200).json(tablero);
  } catch (error) {
    console.error('Error al obtener tablero:', error);
    return res.status(500).json({
      error: 'Error al obtener tablero.',
    });
  }
};

// POST /api/tableros - Crear un nuevo tablero
const crearTablero = async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;
    const usuarioId = req.usuario.id;

    if (!titulo) {
      return res.status(400).json({
        error: 'El título del tablero es obligatorio.',
      });
    }

    const nuevoTablero = await Tablero.create({
      titulo,
      descripcion,
      usuarioId,
    });

    return res.status(201).json({
      mensaje: 'Tablero creado exitosamente.',
      tablero: nuevoTablero,
    });
  } catch (error) {
    console.error('Error al crear tablero:', error);
    return res.status(500).json({
      error: 'Error al crear tablero.',
    });
  }
};

// PUT /api/tableros/:id - Actualizar un tablero
const actualizarTablero = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion } = req.body;
    const usuarioId = req.usuario.id;

    const tablero = await Tablero.findOne({
      where: { id, usuarioId },
    });

    if (!tablero) {
      return res.status(404).json({
        error: 'Tablero no encontrado.',
      });
    }

    await tablero.update({ titulo, descripcion });

    return res.status(200).json({
      mensaje: 'Tablero actualizado exitosamente.',
      tablero,
    });
  } catch (error) {
    console.error('Error al actualizar tablero:', error);
    return res.status(500).json({
      error: 'Error al actualizar tablero.',
    });
  }
};

// DELETE /api/tableros/:id - Eliminar un tablero
const eliminarTablero = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const tablero = await Tablero.findOne({
      where: { id, usuarioId },
    });

    if (!tablero) {
      return res.status(404).json({
        error: 'Tablero no encontrado.',
      });
    }

    await tablero.destroy();

    return res.status(200).json({
      mensaje: 'Tablero eliminado exitosamente.',
    });
  } catch (error) {
    console.error('Error al eliminar tablero:', error);
    return res.status(500).json({
      error: 'Error al eliminar tablero.',
    });
  }
};

module.exports = {
  obtenerTableros,
  obtenerTablero,
  crearTablero,
  actualizarTablero,
  eliminarTablero,
};
