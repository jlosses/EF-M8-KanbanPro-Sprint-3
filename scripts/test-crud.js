require("dotenv").config();
const { sequelize, Usuario, Tablero, Lista, Tarjeta } = require('../src/models');

async function testCRUD() {
  try {
    console.log('Iniciando pruebas CRUD...\n');

    // 1. CREATE
    console.log('1. CREAR: Nueva Tarjeta');
    const listaExistente = await Lista.findOne();
    if (!listaExistente) {
      console.log('No hay listas existentes.');
      return;
    }
    const nuevaTarjeta = await Tarjeta.create({
      titulo: 'Nueva Tarea de Prueba',
      descripcion: 'Descripción de prueba',
      listaId: listaExistente.id,
    });
    console.log('Tarjeta creada:', nuevaTarjeta.toJSON());
    console.log('');

    // 2. READ
    console.log('2. LEER: Tablero con Listas y Tarjetas');
    const tableroConDatos = await Tablero.findOne({
      include: [
        {
          model: Lista,
          as: 'listas',
          include: [
            {
              model: Tarjeta,
              as: 'tarjetas',
            },
          ],
        },
      ],
    });
    if (tableroConDatos) {
      console.log('Tablero encontrado:', tableroConDatos.titulo);
      tableroConDatos.listas.forEach((lista) => {
        console.log(`  Lista: ${lista.titulo}`);
        lista.tarjetas.forEach((tarjeta) => {
          console.log(`    Tarjeta: ${tarjeta.titulo}`);
        });
      });
    } else {
      console.log('No se encontró tablero.');
    }
    console.log('');

    // 3. UPDATE
    console.log('3. ACTUALIZAR: Título de Tarjeta');
    const tarjetaAActualizar = await Tarjeta.findOne();
    if (tarjetaAActualizar) {
      await tarjetaAActualizar.update({ titulo: 'Título Actualizado' });
      console.log('Tarjeta actualizada:', tarjetaAActualizar.toJSON());
    } else {
      console.log('No hay tarjetas para actualizar.');
    }
    console.log('');

    // 4. DELETE
    console.log('4. BORRAR: Eliminar Tarjeta');
    const tarjetaAEliminar = await Tarjeta.findOne({ where: { titulo: 'Nueva Tarea de Prueba' } });
    if (tarjetaAEliminar) {
      await tarjetaAEliminar.destroy();
      console.log('Tarjeta eliminada exitosamente.');
    } else {
      console.log('No se encontró la tarjeta a eliminar.');
    }
    console.log('');

    console.log('Pruebas CRUD completadas exitosamente.');

  } catch (error) {
    console.error('Error en pruebas CRUD:', error);
  } finally {
    await sequelize.close();
  }
}

testCRUD();