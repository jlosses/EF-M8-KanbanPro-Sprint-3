const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lista = sequelize.define('Lista', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Lista;