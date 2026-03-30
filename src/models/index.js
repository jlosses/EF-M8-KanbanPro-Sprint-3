const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Tablero = require('./Tablero');
const Lista = require('./Lista');
const Tarjeta = require('./Tarjeta');

// Asociaciones
Usuario.hasMany(Tablero, { foreignKey: 'usuarioId', as: 'tableros' });
Tablero.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Tablero.hasMany(Lista, { foreignKey: 'tableroId', as: 'listas' });
Lista.belongsTo(Tablero, { foreignKey: 'tableroId', as: 'tablero' });

Lista.hasMany(Tarjeta, { foreignKey: 'listaId', as: 'tarjetas' });
Tarjeta.belongsTo(Lista, { foreignKey: 'listaId', as: 'lista' });

module.exports = {
  sequelize,
  Usuario,
  Tablero,
  Lista,
  Tarjeta,
};