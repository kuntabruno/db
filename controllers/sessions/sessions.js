'use strict';
const SessionSvc = require('../../services/index').Session;
const JsonSvc = require('../../services/index').json;
const sessionSvc = new SessionSvc();
const json = new JsonSvc();
let sck;
class SessionCtrl{
     constructor(io){
     sck = io;
     }
     listenOnSessions(socket){
        function errorMsg(socketId, e){
        return sck.to(socketId).emit('erroneous', e && e.message ? e : {message: `Something went wrong, please try again`});
        }
        socket.on('createSession', data => {
        let socketId = data.socketId;
        if(data.socketId && data.session && data.session.place){
        sessionSvc.create(data.session).then(result => {
        sck.in(data.session.place).emit('createdSession', result);
        }).catch(e => {
        errorMsg(socketId, e);
        });
        }
        });
        socket.on('deleteSession', data => {
        let socketId = data.socketId;
        if(data.socketId && data.sessionId && data.placeId){
        sessionSvc.singleUnpopulated(data.sessionId).then(session => {
        if(!session.active){
        sessionSvc.delete(data.sessionId).then(result => {
        sck.in(data.placeId).emit('deletedSession', result);
        }).catch(e => {
        errorMsg(socketId, e);
        });
        } else {
        errorMsg(socketId, {message: `Delete Failed: Session is still active`});
        }
        }).catch(e => {
        errorMsg(socketId, e);
        });
        }
        });
        socket.on('getPlaceSessions', data => {
        let socketId = data.socketId;
        if(data.socketId && data.placeId){
        sessionSvc.getPlaceSessions(data.placeId, 0, 100).then(result => {
        sck.to(socketId).emit('placeSessions', result);
        }).catch(e => {
        errorMsg(socketId, e);
        });
        }
        });
        socket.on('checkSessionStatus', data => {
        let socketId = data.socketId;
        if(data.sessionId && data.socketId){
        sessionSvc.singleUnpopulated(data.sessionId).then(session => {
        sck.to(socketId).emit('checkedSessionStatus', {record: session.active});
        }).catch(e => {
        errorMsg(socketId, e);
        });
        }
        });
        socket.on('sessionActivate', data => {
        let socketId = data.socketId;
        if(data.socketId && data.sessionId){
        sessionSvc.setActive(data.sessionId).then(result => {
        sck.emit('sessionActivated', result);
        }).catch(e => {
        errorMsg(socketId, e);
        });
        }
        });
        socket.on('sessionDeactivate', data => {
        let socketId = data.socketId;
        if(data.socketId && data.sessionId){
        sessionSvc.setActive(data.sessionId).then(result => {
        sck.emit('sessionDeactivated', result);
        }).catch(e => {
        errorMsg(socketId, e);
        });
        }
        });
     }
     create(req, res){
       sessionSvc.create(req.body).then(data => {
       return json.happy(data, res);
       }).catch(e => {
       return json.unhappy(e, res);
       });
     }
     placeSessions(req, res){
       let placeId = req.params.placeId || req.query.placeId;
       let page = req.params.page || req.query.page;
       let perPage = req.params.perPage || req.query.perPage;
       sessionSvc.getPlaceSessions(placeId, page, perPage).then(data => {
       return json.happy(data, res);
       }).catch(e => {
       return json.unhappy(e, res);
       });
     }
     single(req, res){
       let sessionId = req.params.sessionId;
       sessionSvc.singlePopulated(sessionId).then(data => {
       return json.happy({
       record: data
       }, res);
       }).catch(e => {
       return json.unhappy(e, res);
       });
     }
     delete(req, res){
        let sessionId = req.params.sessionId || req.query.sessionId;
        sessionSvc.delete(sessionId).then(data => {
        return json.happy(data, res);
        }).catch(e => {
        return json.unhappy(e, res);
        });
     }
}
module.exports = SessionCtrl;