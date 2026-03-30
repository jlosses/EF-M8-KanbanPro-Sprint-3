const express = require('express');
const router = express.Router({ mergeParams: true });
const { verificarToken } = require('../middleware/auth');
const {
  obtenerTarjetas,
  crearTarjeta,
  actualizarTarjeta,
  eliminarTarjeta,
} = require('../controllers/tarjetasController');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/listas/:listaId/tarjetas
router.get('/', obtenerTarjetas);

// POST /api/listas/:listaId/tarjetas
router.post('/', crearTarjeta);

// PUT /api/tarjetas/:tarjetaId
router.put('/:tarjetaId', actualizarTarjeta);

// DELETE /api/tarjetas/:tarjetaId
router.delete('/:tarjetaId', eliminarTarjeta);

module.exports = router;
