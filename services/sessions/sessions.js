'use strict';
const Session = require('../../models/index').Sessions;
  class SessionsService {
    constructor(){}
    create(data){
      return new Promise((resolve, reject) => {
      if(data.place && data.name){
      this.singleCriteriaUnpopulated({
      created: new Date(),
      name: data.name
      }).then(val => {
      if(val){
      reject({message: `Create Session Failed, a session with the same date and name already exists`});
      } else {
      let session = new Session(data);
      session.save((err, session) => {
      if(err){
      reject(err);
      } else {
      this.singlePopulated(session._id).then((session) => {
      resolve({
      record: session,
      message: `Successfully created session`
      });
      }).catch((msg) => {
      reject({message: msg});
      });
      }
      });
      }
      }).catch(e => {
      reject(e);
      });
      } else {
      reject({message: `Missing proper idents`})
      }
      });
    }
    singlePopulated(sessionId){
      return new Promise((resolve, reject) => {
      Session.findOne({_id: sessionId})
      .populate('place')
      .exec((err, session) => {
      if(err){
      reject(err);
      } else if(session){
      resolve(session);
      } else {
      reject({message: `Session not found`});
      }
      });
      });
    }
    singleUnpopulated(sessionId){
      return new Promise((resolve, reject) => {
      Session.findOne({_id: sessionId})
      .exec((err, session) => {
      if(err){
      reject(err);
      } else if(session){
      resolve(session);
      } else {
      reject({message: `Session not found`});
      }
      });
      });
    }
    setActive(sessionId){
      return new Promise((resolve, reject) => {
      this.singleUnpopulated(sessionId).then(session => {
      session.active = true;
      session.start = Date.now();
      session.save((err, session) => {
      if(err){
      reject(err);
      } else {
      this.singlePopulated(session._id).then(session => {
      resolve({
      record: session
      });
      }).catch(e => {
      reject(e);
      });
      }
      });
      }).catch(e => {
      reject(e)
      });
      });
    }
    setInactive(sessionId){
      return new Promise((resolve, reject) => {
      this.singleUnpopulated(sessionId).then(session => {
      session.active = false;
      session.stop = Date.now();
      session.save((err, session) => {
      if(err){
      reject(err);
      } else {
      this.singlePopulated(session._id).then(session => {
      resolve({
      record: session
      });
      }).catch(e => {
      reject(e);
      });
      }
      });
      }).catch(e => {
      reject(e)
      });
      });
    }
    updateAverageAndLastValue(sessionId, data){
      return new Promise((resolve, reject) => {
      const PlaceSvc = require('../index').Place;
      const placeSvc = new PlaceSvc();
      this.singleUnpopulated(sessionId).then(session => {
      session.average = data.average || session.average;
      session.last = data.last || session.last;
      session.save((err, session) => {
      if(err){
      reject(err);
      } else {
      setTimeout(() => {
      placeSvc.updateLastAndAverageValues(session.place);
      }, 200);
      this.singlePopulated(sessionId).then(session => {
      resolve({
      record: session
      });
      }).catch(e => {
      reject(e);
      });
      }
      });
      }).catch(e => {
      reject(e);
      });
      });
    }
    singleCriteriaPopulated(criteria){
      return new Promise((resolve, reject) => {
      Session.findOne(criteria)
      .populate('place')
      .exec((err, session) => {
      if(err){
      reject(err);
      } else if(session){
      resolve(session);
      } else {
      reject({message: `Session not found`});
      }
      });
      });
    }
    singleCriteriaUnpopulated(criteria){
      return new Promise((resolve, reject) => {
      Session.findOne(criteria)
      .exec((err, session) => {
      if(err){
      reject(err);
      } else if(session){
      resolve(session);
      } else {
      resolve(null);
      }
      });
      });
    }
    findAndRemove(sessionId){
      return new Promise((resolve, reject) => {
      this.singleUnpopulated(sessionId).then(place => {
      Session.findOneAndRemove({_id: sessionId}, (err, session) => {
      if(err){
      reject(err);
      } else {
      resolve({
      message: `Successully deleted session`,
      sessionId: sessionId
      });
      }
      });
      }).catch(e => {
      reject(e);
      });
      });
    }
    removeAlreadyConfirmedFind(sessionId){
      return new Promise((resolve, reject) => {
      const DecibelSvc = require('../index').Decibel;
      const decibelSvc = new DecibelSvc();
      decibelSvc.removeSessionDecibels(sessionId).then(results => {
      Promise.all(results).then(() => {
      Session.findOneAndRemove({_id: sessionId}, (err, session) => {
      if(err){
      reject(err);
      } else {
      resolve({
      message: `Successully deleted session`,
      sessionId: sessionId
      });
      }
      });
      }).catch(e => {
      reject(e);
      });
      }).catch(e => {
      reject(e);    
      })
      });
    }
    delete(sessionId){
      return new Promise((resolve, reject) => {
      this.findAndRemove(sessionId).then(data => {
      resolve(data);
      }).catch(e => {
      reject(e);
      });
      });
    }
    multiCriteriaPopulated(criteria, page, perPage){
      return new Promise((resolve, reject) => {
      criteria = criteria ? criteria : {};
      page = page ? page : 0;
      perPage = perPage ? perPage : 100;
      Session.find(criteria)
      .populate('place')
      .skip(parseInt(page) * perPage)
      .limit(perPage+1)
      .exec((err, sessions) => {
      if(err){
      reject(err);
      } else {
      let morePages = perPage < sessions.length;
      if(morePages){
      sessions.pop();
      } 
      resolve({
      records: sessions,
      morePages: morePages
      });
      }
      });
      });
    }
    multiCriteriaUnpopulatedWithoutSkip(criteria){
      return new Promise((resolve, reject) => {
      criteria = criteria ? criteria : {};
      Session.find(criteria)
      .exec((err, sessions) => {
      if(err){
      reject(err);
      } else {
      resolve({
      records: sessions,
      });
      }
      });
      });
    }
    getPlaceSessions(placeId, page, perPage){ 
      return new Promise((resolve, reject) => {
      this.multiCriteriaPopulated({place: placeId}, page, perPage).then(data => {
      resolve(data);
      }).catch(e => {
      reject(e);
      });
      });
    }
    removePlaceSessions(placeId){
      return new Promise((resolve, reject) => {
      this.multiCriteriaUnpopulatedWithoutSkip({place: placeId}).then(data => {
      let newrecords = data.records.map((record) => {
      return new Promise((resolve, reject) => {
      if(record && record._id){
      this.removeAlreadyConfirmedFind(record._id).then(data => {
      resolve(true);
      }).catch(e => {
      reject(e);
      })
      } else {
      resolve(false)
      }
      });
      });
      resolve(newrecords);
      }).catch(e => {
      reject(e);
      });
      });
    }
    removePlacesAndDecibels(placeId){
      return new Promise((resolve, reject) => {
      const DecibelSvc = require('../index').Decibel;
      const decibelSvc = new DecibelSvc();
      Promise.all([])
      });
    }
    static getLastAndAverageValues(arr){
      return new Promise((resolve, reject) => {
        let avg = 0;
        let lst = 0;
        let divider = 1;
        for (let i = 0; i < arr.length; i++) {
        if(arr[i].average > 0){
        avg = Math.round(arr[i].average + avg/divider)
        divider++;
        }
        }
        resolve({
        average: avg,
        last: arr.length > 0 ? arr[arr.length - 1].average : 0
        });
        });
   }
    }
    module.exports = SessionsService;