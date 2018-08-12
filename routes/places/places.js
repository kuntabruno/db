'use strict';
const express = require('express');
const PlacesCtrl = require('../../controllers/index').places;
const AuthSvc = require('../../services/index').auth;
const router = express.Router();
const authSvc = new AuthSvc();
module.exports = io => {
    const placeCtrl = new PlacesCtrl(io);
    router.post('/', authSvc.ensureAuthorized, placeCtrl.create);
    router.put('/', authSvc.ensureAuthorized, placeCtrl.modify);
    router.get('/',  placeCtrl.list);
    router.get('/:placeId', placeCtrl.single);
    router.delete('/:placeId', authSvc.ensureAuthorized, placeCtrl.delete);
  return router;
};
