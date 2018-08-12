'use strict';
const express = require('express');
const UserCtrl = require('../../controllers/index').users;
const AuthSvc = require('../../services/index').auth;
const router = express.Router();
module.exports = io => {
const userCtrl = new UserCtrl(io);
const authSvc = new AuthSvc();
router.put('/', userCtrl.modify);
router.get('/', userCtrl.list);
router.delete('/:userId', userCtrl.delete);
router.delete('/', userCtrl.deleteAll);
router.get('/search/:keyword', userCtrl.search);
return router;
} 
