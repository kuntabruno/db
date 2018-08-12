'use strict';
const express = require('express');
const authcontroller = require('../../controllers/auth/auth');
const svc = require('../../services/index');
const auth = new svc.auth();

let controller = new authcontroller();
let router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', controller.me);

module.exports = router;
