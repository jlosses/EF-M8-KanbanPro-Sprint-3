const express = require('express');
const router = express.Router({ mergeParams: true });
// mergeParams: true permite acceder a parámetros de rutas padre (:tableroId)
const { verificarToken } = require('../middleware/auth');
const {
  obtenerListas,
  crearLista,
  actualizarLista,
  eliminarLista,
} = require('../controllers/listasController');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/tableros/:tableroId/listas
router.get('/', obtenerListas);

// POST /api/tableros/:tableroId/listas
router.post('/', crearLista);

// PUT /api/listas/:listaId
router.put('/:listaId', actualizarLista);

// DELETE /api/listas/:listaId
router.delete('/:listaId', eliminarLista);

module.exports = router;
