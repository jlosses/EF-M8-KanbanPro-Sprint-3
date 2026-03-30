const fs = require('fs')
const hbs = require('hbs')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const sequelize = require('./src/config/database')

const app = express()

// 1. Configuración de Archivos Estáticos
app.use(express.static(path.join(__dirname, '/public')));

// 2. Middleware para parsear JSON y cookies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// 3. Configuración del Motor de Plantillas (HBS)
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, '/views'));

// ==================== RUTAS DE API ====================
// Importar rutas de API
const authRoutes = require('./src/routes/auth');
const tablerosRoutes = require('./src/routes/tableros');
const listasRoutes = require('./src/routes/listas');
const tarjetasRoutes = require('./src/routes/tarjetas');

// Registrar rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/tableros', tablerosRoutes);
// Las listas se anidan bajo tableros
app.use('/api/tableros/:tableroId/listas', listasRoutes);
// Las tarjetas se anidan bajo listas
app.use('/api/listas/:listaId/tarjetas', tarjetasRoutes);

// ==================== RUTAS DE VISTAS (Handlebars) ====================
// Estas rutas renderizarán las plantillas HTML

// 4. Rutas

// Importar controladores para procesamiento de formularios
const authController = require('./src/controllers/authController');
const dashboardController = require('./src/controllers/dashboardController');
const asyncHandler = require('./src/middleware/asyncHandler');

// ==================== MIDDLEWARE DE AUTENTICACIÓN PARA VISTAS ====================
// Middleware que verifica el JWT almacenado en cookies
const verificarTokenVistas = (req, res, next) => {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (!token) {
        return res.redirect('/login');
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta');
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.redirect('/login');
    }
};

// Middleware para pasar el usuario autenticado a las vistas (opcional)
const pagarUsuarioAVistas = (req, res, next) => {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.token;
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta');
            res.locals.usuario = decoded;
        } catch (err) {
            // Token inválido, no inyectar usuario
        }
    }
    next();
};

// Usar el middleware para todas las vistas
app.use(pagarUsuarioAVistas);





// Ruta de inicio
app.get('/', (req, res) => {
    res.render('home', { title: 'Inicio' });
});

// Ruta de registro
app.get('/registro', (req, res) => {
    res.render('register', { title: 'Registro' });
});

// Procesar registro del formulario
app.post('/registro', async (req, res) => {
    try {
        const { email, password, nombre } = req.body;

        // Verificar que los datos existan
        if (!email || !password) {
            return res.status(400).render('register', {
                error: 'Email y contraseña son requeridos',
                title: 'Registro'
            });
        }

        // Verificar si el usuario ya existe
        const { Usuario } = require('./src/models');
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).render('register', {
                error: 'El usuario ya existe',
                title: 'Registro'
            });
        }

        // Hashear la contraseña
        const bcrypt = require('bcrypt');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear el usuario
        const nuevoUsuario = await Usuario.create({
            email,
            password: hashedPassword,
            nombre,
        });

        // Crear un JWT
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: nuevoUsuario.id, email: nuevoUsuario.email },
            process.env.JWT_SECRET || 'clave_secreta',
            { expiresIn: '1h' },
        );

        // Guardar token en cookie
        res.cookie('token', token, { httpOnly: true, maxAge: 1 * 60 * 60 * 1000 });

        res.redirect('/login');
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).render('register', {
            error: 'Error al registrar el usuario.',
            title: 'Registro'
        });
    }
});


// Ruta de login
app.get('/login', (req, res) => {
    res.render('login', { title: 'Inicio de Sesión' });
});

// Procesar login del formulario (redirigido a API)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar que los datos existan
        if (!email || !password) {
            return res.status(400).render('login', {
                error: 'Email y contraseña son requeridos',
                title: 'Inicio de Sesión'
            });
        }

        // Buscar el usuario en la BD
        const { Usuario } = require('./src/models');
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(401).render('login', {
                error: 'Email o contraseña incorrectos.',
                title: 'Inicio de Sesión'
            });
        }

        // Comparar la contraseña ingresada con la hasheada
        const bcrypt = require('bcrypt');
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).render('login', {
                error: 'Email o contraseña incorrectos.',
                title: 'Inicio de Sesión'
            });
        }

        // Crear un JWT
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET || 'clave_secreta',
            { expiresIn: '7d' },
        );

        // Guardar token en cookie o sesión (aquí usamos cookie)
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).render('login', {
            error: 'Error al iniciar sesión.',
            title: 'Inicio de Sesión'
        });
    }
});

// Ruta del dashboard (página principal después de login) - PROTEGIDA
app.get('/dashboard', verificarTokenVistas, asyncHandler(dashboardController.obtenerDashboard));

// Ruta POST para crear nueva tarjeta (Sprint-1) - PROTEGIDA
app.post('/nueva-tarjeta', verificarTokenVistas, (req, res) => {
    try {
        const { listId, title, description } = req.body;
        const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
        
        // Asumiendo un solo tablero por ahora
        const board = data.boards[0];
        const list = board.lists.find(l => l.id == listId);
        
        if (list) {
            // Calcular nuevo ID para la tarjeta
            const allCards = board.lists.reduce((acc, l) => acc.concat(l.cards), []);
            const newId = allCards.length > 0 ? Math.max(...allCards.map(c => c.id)) + 1 : 1;
            
            // Crear nueva tarjeta
            list.cards.push({ id: newId, title, description });
            
            // Escribir los cambios en el archivo
            fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        }
        
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error al crear tarjeta:', error);
        res.status(500).send('Error al crear la tarjeta');
    }
});

// Ruta POST para crear nuevo tablero - PROTEGIDA
app.post('/crear-tablero', verificarTokenVistas, async (req, res) => {
    try {
        const { titulo, descripcion } = req.body;
        const usuarioId = req.usuario.id;

        if (!titulo) {
            return res.status(400).json({
                error: 'El título del tablero es obligatorio.',
            });
        }

        const { Tablero } = require('./src/models');
        const nuevoTablero = await Tablero.create({
            titulo,
            descripcion,
            usuarioId,
        });

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error al crear tablero:', error);
        res.status(500).render('dashboard', {
            error: 'Error al crear el tablero',
            title: 'Dashboard',
        });
    }
});

// Ruta POST para crear nueva lista - PROTEGIDA
app.post('/crear-lista', verificarTokenVistas, async (req, res) => {
    try {
        const { tableroId, titulo } = req.body;
        const usuarioId = req.usuario.id;

        if (!titulo) {
            return res.status(400).json({
                error: 'El título de la lista es obligatorio.',
            });
        }

        if (!tableroId) {
            return res.status(400).json({
                error: 'El ID del tablero es obligatorio.',
            });
        }

        // Verificar que el tablero pertenece al usuario
        const { Tablero, Lista } = require('./src/models');
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

        await Lista.create({
            titulo,
            tableroId,
            posicion: conteoListas + 1,
        });

        res.redirect(`/dashboard`);
    } catch (error) {
        console.error('Error al crear lista:', error);
        res.status(500).render('dashboard', {
            error: 'Error al crear la lista',
            title: 'Dashboard',
        });
    }
});

// Ruta para ver un tablero específico
app.get('/tablero/:id', (req, res) => {
  res.render('tablero', { tableroId: req.params.id });
});

// Ruta de logout
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).render('404');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  
  // Si es una ruta de API, devolver JSON
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
  
  // Si es una ruta de página, renderizar vista de error
  res.status(500).render('error', {
    error: 'Error interno del servidor. Por favor intenta nuevamente.',
    title: 'Error',
  }).catch((renderErr) => {
    // Si no existe la vista error, fallback a página simple
    res.status(500).send(`
      <h1>Error</h1>
      <p>Error interno del servidor. Por favor intenta nuevamente.</p>
      <a href="/">Volver al inicio</a>
    `);
  });
});

// ==================== SINCRONIZAR BD E INICIAR SERVIDOR ====================
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: false }).then(() => {
  console.log('✅ Base de datos sincronizada');
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('❌ Error al sincronizar la base de datos:', error);
});

module.exports = app;
