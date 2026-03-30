const { Sequelize } = require("sequelize");
const pg = require("pg");
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(process.env.DB_URI, {
    dialect: "postgres",
    dialectModule: pg,
    /* dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    }, */
})

module.exports = sequelize;