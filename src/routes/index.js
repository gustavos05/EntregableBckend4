const express = require('express');
const usersR = require('./users.router');
const router = express.Router();

// colocar las rutas aquí
router.use('/users',usersR)

module.exports = router;