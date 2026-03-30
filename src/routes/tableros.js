const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const {
  obtenerTableros,
  obtenerTablero,
  crearTablero,
  actualizarTablero,
  eliminarTablero,
} = require('../controllers/tablerosController');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/tableros - Obtener todos los tableros del usuario
router.get('/', obtenerTableros);

// GET /api/tableros/:id - Obtener un tablero específico
router.get('/:id', obtenerTablero);

// POST /api/tableros - Crear un nuevo tablero
router.post('/', crearTablero);

// PUT /api/tableros/:id - Actualizar un tablero
router.put('/:id', actualizarTablero);

// DELETE /api/tableros/:id - Eliminar un tablero
router.delete('/:id', eliminarTablero);

module.exports = router;
