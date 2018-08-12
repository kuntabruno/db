'use strict';
const express = require('express');
const SessionsCtrl = require('../../controllers/index').sessions;
const AuthSvc = require('../../services/index').auth;
const router = express.Router();
const authSvc = new AuthSvc();
module.exports = io => {
  const sessionCtrl = new SessionsCtrl(io);
  router.post('/', authSvc.ensureAuthorized, sessionCtrl.create);
  router.get('/placesessions/:placeId', sessionCtrl.placeSessions);
  router.get('/:sessionId', sessionCtrl.single);
  router.delete('/:sessionId', authSvc.ensureAuthorized, sessionCtrl.delete);
  return router;
};