require("dotenv").config();
const { sequelize, Usuario, Tablero, Lista, Tarjeta } = require('../src/models');

async function seedDatabase() {
  try {
    // Sincronizar modelos con la BD (crea tablas)
    await sequelize.sync({ force: true });
    console.log('Tablas creadas exitosamente.');

    // Crear usuarios de ejemplo
    const usuario1 = await Usuario.create({
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'password123',
    });

    const usuario2 = await Usuario.create({
      nombre: 'María García',
      email: 'maria@example.com',
      password: 'password456',
    });

    console.log('Usuarios creados.');

    // Crear tableros
    const tablero1 = await Tablero.create({
      titulo: 'Proyecto Web',
      descripcion: 'Desarrollo de sitio web',
      usuarioId: usuario1.id,
    });

    const tablero2 = await Tablero.create({
      titulo: 'Tareas Personales',
      descripcion: 'Lista de tareas diarias',
      usuarioId: usuario1.id,
    });

    const tablero3 = await Tablero.create({
      titulo: 'Planificación Vacaciones',
      descripcion: 'Organizar viaje',
      usuarioId: usuario2.id,
    });

    console.log('Tableros creados.');

    // Crear listas para tablero1
    const lista1 = await Lista.create({
      titulo: 'To Do',
      tableroId: tablero1.id,
    });

    const lista2 = await Lista.create({
      titulo: 'In Progress',
      tableroId: tablero1.id,
    });

    const lista3 = await Lista.create({
      titulo: 'Done',
      tableroId: tablero1.id,
    });

    // Crear listas para tablero2
    const lista4 = await Lista.create({
      titulo: 'Compras',
      tableroId: tablero2.id,
    });

    console.log('Listas creadas.');

    // Crear tarjetas
    await Tarjeta.create({
      titulo: 'Diseñar homepage',
      descripcion: 'Crear mockup de la página principal',
      listaId: lista1.id,
    });

    await Tarjeta.create({
      titulo: 'Implementar login',
      descripcion: 'Agregar formulario de login',
      listaId: lista2.id,
    });

    await Tarjeta.create({
      titulo: 'Revisar código',
      descripcion: 'Code review del backend',
      listaId: lista3.id,
    });

    await Tarjeta.create({
      titulo: 'Comprar leche',
      descripcion: 'Ir al supermercado',
      listaId: lista4.id,
    });

    console.log('Tarjetas creadas.');
    console.log('Base de datos poblada exitosamente.');

  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();