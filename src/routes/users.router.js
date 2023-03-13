const { getAll, create, getOne, remove, update,verifyEmail, login, getLoggedUser } = require('../controllers/users.controllers');
const express = require('express');
const verifyJWT=require('../utils/verifyJWT')

const usersR = express.Router();

usersR.route('/')
    .get(verifyJWT,getAll)
    .post(create);
    
usersR.route('/verify/:code')
    .get(verifyEmail);

usersR.route("/login")
    .post(login);

usersR.route("/me")
    .get(verifyJWT,getLoggedUser)

usersR.route('/:id')
    .get(verifyJWT,getOne)
    .delete(verifyJWT,remove)
    .put(verifyJWT,update);

module.exports = usersR;