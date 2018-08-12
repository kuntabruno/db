'use strict';
const jwt = require('jsonwebtoken');

const UserSvc = require('../users/users');
const JsonSvc = require('../json/json'); 

const userSvc = new UserSvc();
const json = new JsonSvc();
let findByToken = token => {
  return new Promise((resolve, reject) => {
  if(token){
  userSvc.singleCriteria({token: token}).then(user => {
  if(user){
  resolve(user)
  } else {
  reject();
  }
  }).catch(e => {
  reject();
  });
  } else {
  reject();
  }
  });
}
let checkBearerHeader = bearerHeader => {
  return new Promise((resolve, reject) => {
  if(typeof bearerHeader !== 'undefined'){
  let bearer = bearerHeader.split(" ");
  bearerToken = bearer[1];
  resolve(bearerToken);
  } else {
  reject();
  }
  });
}
class AuthService {
    constructor(){}
    ensureAuthorized(req, res, next){
      let bearerToken;
      let bearerHeader = req.headers.authorization;
      checkBearerHeader(bearerHeader).then(token => {
      findByToken(token).then(user => {
      req.user = user;
      next();
      }).catch(e => {
      res.sendStatus(403);
      });
      }).catch(e => {
      res.sendStatus(403);
      });
    }

    justGetUser(req, res, next){
      let bearerToken;
      let bearerHeader = req.headers.authorization;
      checkBearerHeader(bearerHeader).then(token => {
      findByToken(token).then(user => {
      req.user = user;
      next();
      }).catch(e => {
      req.user = null;
      next();
      });
      }).catch(e => {
      req.user = null;
      next();
      });
    }

    ensureAdmin(req, res, next){
      let user = req.user;
      if(user){
      let index = user.roles.indexOf('admin');
      if(index !== -1){
      next();
      } else {
      return json.unhappy(e, {
      message: `You are not allowed to perform this action`
      }, 401);
      }
      } else {
      return json.unhappy(e, {
      message: `Unauthorized`
      }, 403);
      }
    }
}
module.exports = AuthService;