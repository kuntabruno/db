const UserSvc = require('../../services/index').User;
const PlaceCtrl = require('../places/places');
const SessionCtrl = require('../sessions/sessions');
const DecibelCtrl = require('../decibels/decibels');
const JsonSvc = require('../../services/index').json;
const userSvc = new UserSvc();
const json = new JsonSvc();
let sck;
class UserController{
    constructor(io){
    sck = io;
    this.listenOnUsers(io);
    }
    listenOnUsers(io){
      const placeCtrl = new PlaceCtrl(io);
      const sessionCtrl = new SessionCtrl(io);
      const decibelCtrl = new DecibelCtrl(io);
      sck.on('connection', socket => {
      sck.to(socket.id).emit('receiveswackid', {socketId: socket.id});
      placeCtrl.listenOnPlaces(socket);
      sessionCtrl.listenOnSessions(socket);
      decibelCtrl.listenOnDecibels(socket);
      });
    }
    list(req, res){
      let page = req.query.page || req.params.page;
      let perPage = req.query.perPage || req.params.perPage;
      userSvc.list(page, perPage).then(data => {
      json.happy(data, res);
      }).catch(e => {
      json.unhappy(e, res);
      });
    }
    search(req, res){
      let keyword = req.params.keyword;
      let userId = req.params.userId || req.user._id || null;
      userSvc.search(keyword, userId).then(data => {
      json.happy(data, res);
      }).catch(e => {
      json.unhappy(e, res);
      });
    }
    modify(req, res){
      let user = req.user;
      userSvc.modify(user, req.body).then(data => {
      json.happy(data, res);
      }).catch(e => {
      json.unhappy(e, res);
      });
    }
    delete(req, res){
      let userId = re.params.userId || req.query.userId;
      userSvc.delete(userId).then(data => {
      json.happy(data, res);
      }).catch(e => {
      json.unhappy(e, res);
      });
    }

    deleteAll(req, res){
      userSvc.deleteAll().then(data => {
      json.happy(data, res);
      }).catch(e => {
      json.unhappy(e, res);
      });
    }
    
}

module.exports = UserController;