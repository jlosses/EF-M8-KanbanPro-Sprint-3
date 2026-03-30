const Lista = require('../models/Lista');
const Tablero = require('../models/Tablero');
const Tarjeta = require('../models/Tarjeta');

// GET /api/tableros/:tableroId/listas - Obtener todas las listas de un tablero
const obtenerListas = async (req, res) => {
  try {
    const { tableroId } = req.params;
    const usuarioId = req.usuario.id;

    // Verificar que el tablero pertenece al usuario
    const tablero = await Tablero.findOne({
      where: { id: tableroId, usuarioId },
    });

    if (!tablero) {
      return res.status(404).json({
        error: 'Tablero no encontrado.',
      });
    }

    // Obtener las listas con sus tarjetas
    const listas = await Lista.findAll({
      where: { tableroId },
      include: {
        model: Tarjeta,
        as: 'tarjetas',
      },
      order: [['posicion', 'ASC']], // Ordenar por posición
    });

    return res.status(200).json(listas);
  } catch (error) {
    console.error('Error al obtener listas:', error);
    return res.status(500).json({
      error: 'Error al obtener listas.',
    });
  }
};

// POST /api/tableros/:tableroId/listas - Crear una nueva lista
const crearLista = async (req, res) => {
  try {
    const { tableroId } = req.params;
    const { titulo } = req.body;
    const usuarioId = req.usuario.id;

    if (!titulo) {
      return res.status(400).json({
        error: 'El título de la lista es obligatorio.',
      });
    }

    // Verificar que el tablero pertenece al usuario
    const tablero = await Tablero.findOne({
      where: { id: tableroId, usuarioId },
    });

    if (!tablero) {
      return res.status(404).json({
        error: 'Tablero no encontrado.',
      });
    }

    // Contar las listas existentes para asignar posición
    const conteoListas = await Lista.count({
      where: { tableroId },
    });

    const nuevaLista = await Lista.create({
      titulo,
      tableroId,
      posicion: conteoListas + 1,
    });

    return res.status(201).json({
      mensaje: 'Lista creada exitosamente.',
      lista: nuevaLista,
    });
  } catch (error) {
    console.error('Error al crear lista:', error);
    return res.status(500).json({
      error: 'Error al crear lista.',
    });
  }
};

// PUT /api/listas/:listaId - Actualizar una lista
const actualizarLista = async (req, res) => {
  try {
    const { listaId } = req.params;
    const { titulo, posicion } = req.body;
    const usuarioId = req.usuario.id;

    // Obtener la lista
    const lista = await Lista.findOne({
      include: {
        model: Tablero,
        where: { usuarioId },
      },
      where: { id: listaId },
    });

    if (!lista) {
      return res.status(404).json({
        error: 'Lista no encontrada.',
      });
    }

    await lista.update({
      titulo: titulo || lista.titulo,
      posicion: posicion || lista.posicion,
    });

    return res.status(200).json({
      mensaje: 'Lista actualizada exitosamente.',
      lista,
    });
  } catch (error) {
    console.error('Error al actualizar lista:', error);
    return res.status(500).json({
      error: 'Error al actualizar lista.',
    });
  }
};

// DELETE /api/listas/:listaId - Eliminar una lista
const eliminarLista = async (req, res) => {
  try {
    const { listaId } = req.params;
    const usuarioId = req.usuario.id;

    // Obtener la lista
    const lista = await Lista.findOne({
      include: {
        model: Tablero,
        where: { usuarioId },
      },
      where: { id: listaId },
    });

    if (!lista) {
      return res.status(404).json({
        error: 'Lista no encontrada.',
      });
    }

    // Eliminar todas las tarjetas de la lista
    await Tarjeta.destroy({
      where: { listaId },
    });

    // Eliminar la lista
    await lista.destroy();

    return res.status(200).json({
      mensaje: 'Lista eliminada exitosamente.',
    });
  } catch (error) {
    console.error('Error al eliminar lista:', error);
    return res.status(500).json({
      error: 'Error al eliminar lista.',
    });
  }
};

module.exports = {
  obtenerListas,
  crearLista,
  actualizarLista,
  eliminarLista,
};
