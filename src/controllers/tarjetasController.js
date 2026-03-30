const Tarjeta = require('../models/Tarjeta');
const Lista = require('../models/Lista');
const Tablero = require('../models/Tablero');

// GET /api/listas/:listaId/tarjetas - Obtener todas las tarjetas de una lista
const obtenerTarjetas = async (req, res) => {
  try {
    const { listaId } = req.params;
    const usuarioId = req.usuario.id;

    // Verificar que la lista pertenece a un tablero del usuario
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

    const tarjetas = await Tarjeta.findAll({
      where: { listaId },
      order: [['posicion', 'ASC']],
    });

    return res.status(200).json(tarjetas);
  } catch (error) {
    console.error('Error al obtener tarjetas:', error);
    return res.status(500).json({
      error: 'Error al obtener tarjetas.',
    });
  }
};

// POST /api/listas/:listaId/tarjetas - Crear una nueva tarjeta
const crearTarjeta = async (req, res) => {
  try {
    const { listaId } = req.params;
    const { titulo, descripcion } = req.body;
    const usuarioId = req.usuario.id;

    if (!titulo) {
      return res.status(400).json({
        error: 'El título de la tarjeta es obligatorio.',
      });
    }

    // Verificar que la lista pertenece a un tablero del usuario
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

    // Contar las tarjetas existentes para asignar posición
    const conteoTarjetas = await Tarjeta.count({
      where: { listaId },
    });

    const nuevaTarjeta = await Tarjeta.create({
      titulo,
      descripcion,
      listaId,
      posicion: conteoTarjetas + 1,
    });

    return res.status(201).json({
      mensaje: 'Tarjeta creada exitosamente.',
      tarjeta: nuevaTarjeta,
    });
  } catch (error) {
    console.error('Error al crear tarjeta:', error);
    return res.status(500).json({
      error: 'Error al crear tarjeta.',
    });
  }
};

// app.post('/nueva-tarjeta', (req, res) => {
//    const { listId, title, description } = req.body;
//    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
//    // Asumiendo un solo board
//    const board = data.boards[0];
//    const list = board.lists.find(l => l.id == listId);
//    if (list) {
//        const newId = list.cards.length > 0 ? Math.max(...list.cards.map(c => c.id)) + 1 : 1;
//        list.cards.push({ id: newId, title, description });
//        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
//    }
//    res.redirect('/dashboard');
//});

// PUT /api/tarjetas/:tarjetaId - Actualizar una tarjeta
const actualizarTarjeta = async (req, res) => {
  try {
    const { tarjetaId } = req.params;
    const { titulo, descripcion, listaId, posicion } = req.body;
    const usuarioId = req.usuario.id;

    // Obtener la tarjeta
    const tarjeta = await Tarjeta.findOne({
      include: {
        model: Lista,
        include: {
          model: Tablero,
          where: { usuarioId },
        },
      },
      where: { id: tarjetaId },
    });

    if (!tarjeta) {
      return res.status(404).json({
        error: 'Tarjeta no encontrada.',
      });
    }

    await tarjeta.update({
      titulo: titulo || tarjeta.titulo,
      descripcion: descripcion || tarjeta.descripcion,
      listaId: listaId || tarjeta.listaId,
      posicion: posicion || tarjeta.posicion,
    });

    return res.status(200).json({
      mensaje: 'Tarjeta actualizada exitosamente.',
      tarjeta,
    });
  } catch (error) {
    console.error('Error al actualizar tarjeta:', error);
    return res.status(500).json({
      error: 'Error al actualizar tarjeta.',
    });
  }
};

// DELETE /api/tarjetas/:tarjetaId - Eliminar una tarjeta
const eliminarTarjeta = async (req, res) => {
  try {
    const { tarjetaId } = req.params;
    const usuarioId = req.usuario.id;

    // Obtener la tarjeta
    const tarjeta = await Tarjeta.findOne({
      include: {
        model: Lista,
        include: {
          model: Tablero,
          where: { usuarioId },
        },
      },
      where: { id: tarjetaId },
    });

    if (!tarjeta) {
      return res.status(404).json({
        error: 'Tarjeta no encontrada.',
      });
    }

    await tarjeta.destroy();

    return res.status(200).json({
      mensaje: 'Tarjeta eliminada exitosamente.',
    });
  } catch (error) {
    console.error('Error al eliminar tarjeta:', error);
    return res.status(500).json({
      error: 'Error al eliminar tarjeta.',
    });
  }
};

module.exports = {
  obtenerTarjetas,
  crearTarjeta,
  actualizarTarjeta,
  eliminarTarjeta,
};
