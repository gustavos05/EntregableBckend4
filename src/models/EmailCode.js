const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Ecode = sequelize.define('ecode', {
    code: {
        type: DataTypes.TEXT,
        allowNull: false
    },
});

module.exports = Ecode;