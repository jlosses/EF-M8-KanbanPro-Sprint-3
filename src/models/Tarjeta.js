const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tarjeta = sequelize.define('Tarjeta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Tarjeta;