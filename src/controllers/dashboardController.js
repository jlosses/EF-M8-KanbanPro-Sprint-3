const { Tablero, Lista, Tarjeta } = require('../models');

// GET /dashboard - Obtener todos los tableros del usuario autenticado con sus listas y tarjetas
const obtenerDashboard = async (req, res) => {
  try {
    console.log('📊 Obteniendo dashboard para usuario ID:', req.usuario?.id);
    
    if (!req.usuario || !req.usuario.id) {
      console.error('❌ Usuario no encontrado en token');
      return res.redirect('/login');
    }

    const usuarioId = req.usuario.id;

    // Obtener todos los tableros del usuario con sus listas y tarjetas
    let tableros = [];
    try {
      tableros = await Tablero.findAll({
        where: { usuarioId },
        include: [
          {
            model: Lista,
            as: 'listas',
            include: [
              {
                model: Tarjeta,
                as: 'tarjetas',
                order: [['posicion', 'ASC']],
              },
            ],
            order: [['posicion', 'ASC']],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    } catch (dbError) {
      console.error('❌ Error en consulta de BD:', dbError.message);
      tableros = [];
    }

    console.log(`✅ Se encontraron ${tableros.length} tableros`);

    // Asegurarse de que tableros sea un array
    if (!Array.isArray(tableros)) {
      tableros = [];
    }

    res.render('dashboard', {
      title: 'Dashboard',
      tableros: tableros || [],
      usuarioId,
    });
  } catch (error) {
    console.error('❌ Error al obtener dashboard:', error.message);
    console.error('Stack:', error.stack);
    
    // Fallback: renderizar con tableros vací
    try {
      res.status(500).render('dashboard', {
        error: 'Error al cargar el dashboard. Por favor, intenta nuevamente.',
        title: 'Dashboard',
        tableros: [],
      });
    } catch (renderError) {
      // Si falla el render, ir al error handler
      throw error;
    }
  }
};

module.exports = {
  obtenerDashboard,
};
