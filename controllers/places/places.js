'use strict';
const PlaceSvc = require('../../services/places/places');
const JsonSvc = require('../../services/json/json');
const placeSvc = new PlaceSvc();
const json = new JsonSvc();
let sck;
class PlaceController {
    constructor(io){
    sck = io;
    }
    listenOnPlaces(socket){
      function errorMsg(socketId, e){
      return sck.to(socketId).emit('erroneous', e && e.message ? e : {message: `An Error occurred, please try again`});
      }
      socket.on('createPlace', data => {
      if(data.socketId){
      placeSvc.create(data.place).then(result => {
      sck.to(data.socketId).emit('createdPlace', result);
      sck.emit('addGeofence', result);
      }).catch(e => {
      errorMsg(data.socketId, e);
      });
      }
      });
      socket.on('updatePlace', data => {
      let socketId = data.socketId;
      if(data.socketId && data.placeId){
      placeSvc.modifyMetadata(data.placeId, data.place).then(result => {
      sck.to(socketId).emit('updatedPlace', result);
      sck.emit('updateGeofence', result);
      }).catch(e => {
      errorMsg(socketId, e);
      });
      }
      });
      socket.on('deletePlace', data => {
      console.log(data);
      let socketId = data.socketId;
      if(data.socketId && data.placeId){
      placeSvc.delete(data.placeId).then(result => {
      sck.to(socketId).emit('deletedPlace', result);
      sck.emit('deleteGeofence', result);
      }).catch(e => {
      errorMsg(socketId, e);
      });
      }
      });
      socket.on('joinPlace', data => {
      console.log(data);
      if(data.placeId){
      socket.join(data.placeId);
      console.log('joined place');
      }
      });
      socket.on('leavePlace', data => {
      if(data.placeId){
      socket.leave(data.placeId);
      console.log('left place')
      }
      });
      socket.on('confirmPlaces', data => {
      let socketId = data.socketId;
      if(data.socketId){
      placeSvc.list({}, 0, 50).then(data => {
      sck.to(socketId).emit('confirmedPlaces', data);
      });
      }
      });
      socket.on('searchPlace', data => {
      let socketId = data.socketId;
      if(data.socketId){
      placeSvc.singleCriteriaPopulated({"location.address": data.address}).then(place => {
      sck.to(socketId).emit('searchedPlace', {record: place});
      }).catch(e => {
      console.log(e && e.message ? e.message : e);
      });
      }
      });
    }
    create(req, res){
      placeSvc.create(req.body).then(data => {
      return json.happy(data, res);
      }).catch(e => {
      return json.unhappy(e, res);
      });
    }
    modify(req, res){
      let placeId = req.body.placeId;
      placeSvc.modifyMetadata(placeId, req.body).then(data => {
      return json.happy(data, res);
      }).catch(e => {
      return json.unhappy(e, res);
      });
    }
    list(req, res){
      let page = req.query.page || req.params.perPage;
      let perPage = req.query.perPage || req.params.perPage;
      let timestamp =  req.params.date || req.query.date || req.params.timestamp || req.query.date;
      placeSvc.list({}, page, perPage, timestamp).then(data => {
      return json.happy(data, res);
      }).catch(e => {
      return json.unhappy(e, res);
      });
    }
    delete(req, res){
      let placeId = req.params.placeId;
      placeSvc.delete(placeId).then(data => {
      return json.happy(data, res);
      }).catch(e => {
      return json.unhappy(e, res);
      });
    }
    single(req, res){
      let placeId = req.params.placeId;
      placeSvc.singlePopulated.then(data => {
      return json.happy({
      record: data
      }, res);
      }).catch(e => {
      return json.unhappy(e, res);
      });
    }
}
module.exports = PlaceController;