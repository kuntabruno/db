'use strict';
const DecibelSvc = require('../../services/index').Decibel;
const PlaceSvc = require('../../services/index').Place;
const SessionSvc = require('../../services/index').Session;
const JsonSvc = require('../../services/index').json;
const decibelSvc = new DecibelSvc();
const placeSvc = new PlaceSvc();
const sessionSvc = new SessionSvc();
const json = new JsonSvc();
let sck;
class DecibelController {
   constructor(io){
   sck = io;
   }
    listenOnDecibels(socket){
        function errorMsg(socketId, e){
        return sck.to(data.socketId).emit('erroneous', e && e.message ? e : {message: `Something went wrong, please try again`});
        }
        socket.on('createDecibel', data => {
        let socketId = data.socketId;
        console.log(`dB Value: ${data.value}`);
        decibelSvc.create(data).then(decibel => {
        decibelSvc.getSessionDecibels(decibel.record.session, 0, 10).then(result => {
        sck.in(data.place).emit('activeSessionDecibels', result);
        sessionSvc.singleUnpopulated(decibel.record.session).then(session => {
        sck.emit('currentSessionAverage', {record: session});
        }).catch(e => {
        console.log(e);
        });
        }).catch(e => {
        console.log(e);
        });
        }).catch(e => {
        console.log(e);
        });
        });
        socket.on('getInactiveSessionDecibels', data => {
        let socketId = data.socketId;
        if(data.socketId && data.sessionId){
        decibelSvc.getSessionDecibels(data.sessionId, 0, 10).then(result => {
        sck.to(socketId).emit('inactiveSessionDecibels', result);
        }).catch(e => {
        errorMsg(socketId, e);
        });
        }
        });
    }
    create(req, res){
      decibelSvc.create(req.body).then(data => {
      return json.happy(data, res);
      }).catch(e => {
      return json.unhappy(e, res);
      });
    }
    sessionDecibels(req, res){
      let sessionId = req.params.sessionId || req.query.sessionId;
      let page = req.params.page || req.query.page;
      let perPage = req.params.perPage || req.query.perPage;
      decibelSvc.getSessionDecibels(sessionId, page, perPage).then(data => {
      return json.happy(data, res);
      }).catch(e => {
      return json.unhappy(e, res);
      });
    }
}
module.exports = DecibelController;