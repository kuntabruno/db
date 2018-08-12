'use strict';
const express = require('express');
const DecibelsCtrl = require('../../controllers/index').decibels;
const AuthSvc = require('../../services/index').auth;
const router = express.Router();
const authSvc = new AuthSvc();
module.exports = io => {
const decibelCtrl = new DecibelsCtrl(io);
router.post('/', authSvc.ensureAuthorized, decibelCtrl.create);
router.get('/sessiondecibels/:sessionId', decibelCtrl.sessionDecibels);
return router;
}; 