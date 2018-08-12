'use strict';
const Place = require('../../models/index').Places;
class PlaceService {
    constructor(){}
    create(data){
      return new Promise((resolve, reject) => {
      const SessionSvc = require('../sessions/sessions');
      if(data.name && data.description){
      this.singleCriteriaUnpopulated({name: data.name}).then(val => {
      if(val){
      reject({message: `Already Exists`});
      } else {
      let place = new Place(data);
      place.save((err, place) => {
      if(err){
      reject(err);
      } else {
      const sessionSvc = new SessionSvc();
      sessionSvc.create({
      place: place._id,
      name: place.name
      }).then(session => {
      place.session = session._id;
      place.save((err, place) => {
      if(err){
      reject(err);
      } else {
      this.singlePopulated(place._id).then(place => {
      resolve({
      message: `Successfully registered ${place.name} as a 'place'`,
      record: place
      });
      }).catch(e => {
      reject(e);
      });
      }
      });
      }).catch(e => {
      reject(e);
      });
      }
      });
      }
      }).catch(e => {
      reject(e);
      });
      } else {
      reject({message: `Both name and descripition are required`});
      }
      });
    }
    modifyMetadata(placeId, data){
      return new Promise((resolve, reject) => {
      if(placeId){
      this.singleUnpopulated(placeId).then(place => {
      place.name = data.name || place.name;
      place.description = data.description || place.description;
      place.location = data.location || place.location;
      place.save((err, place) => {
      if(err){
      reject(err);
      } else {
      this.singlePopulated(place._id).then(place => {
      resolve({
      record: place,
      message: `Successfully updated place details`     
      });
      }).catch(e => {
      reject(e);
      });
      }
      });
      }).catch(e => {
      reject(e);
      });
      } else {
      reject({message: `Missing proper idents`});
      }
      });
    }
    singleCriteriaUnpopulated(criteria){
      return new Promise((resolve, reject) => {
      Place.findOne(criteria)
      .exec((err, place) => {
      if(err){
      reject(err);
      } else if(place){
      resolve(place);
      } else {
      resolve(null)
      }
      });
      });
    }
    singleCriteriaPopulated(criteria){
      return new Promise((resolve, reject) => {
      Place.findOne(criteria)
      .populate('session')
      .exec((err, place) => {
      if(err){
      reject(err);
      } else if(place){
      resolve(place);
      } else {
      resolve(null)
      }
      });
      });
    }
    singleUnpopulated(id){
      return new Promise((resolve, reject) => {
      if(id){
      Place.findOne({_id: id})
      .exec((err, place) => {
      if(err){
      reject(err);
      } else if(place){
      resolve(place);
      } else {
      reject({message: `Place not found`});
      }
      });
      } else {
      reject({message: `Missing proper idents`});
      }
      });
    }
    singlePopulated(id){
      return new Promise((resolve, reject) => {
      if(id){
      Place.findOne({_id: id})
      .populate('session')
      .exec((err, place) => {
      if(err){
      reject(err);
      } else if(place){
      resolve(place);
      } else {
      reject({message: `Place not found`});
      }
      });
      } else {
      reject({message: `Missing proper idents`});
      }
      });
    }
    updateLastAndAverageValues(placeId){
      return new Promise((resolve, reject) => {
      const SessionSvc = require('../index').Session;
      const sessionSvc = new SessionSvc();
      sessionSvc.getPlaceSessions(placeId, 0, 20).then(data => {
      if(data.records){
      SessionSvc.getLastAndAverageValues(data.records).then(obj => {
      this.singleUnpopulated(placeId).then(place => {
      place.average = obj.average || place.average;
      place.last = obj.last || place.last;
      place.save((err, place) => {
      if(err){
      reject(err);
      } else {
      this.singlePopulated(place._id).then(place => {
      resolve({
      record: place
      });
      }).catch(e => {
      reject(e);
      });
      }
      });
      }).catch(e => {
      reject(e);
      });
      }).catch(e => {
      reject(e);
      });
      }
      }).catch(e => {
      reject(e);
      })
      });
    }
    findAndRemove(placeId){
        return new Promise((resolve, reject) => {
        this.singleUnpopulated(placeId).then(place => {
        const SessionSvc = require('../index').Session;
        const sessionSvc = new SessionSvc();
        sessionSvc.removePlaceSessions(placeId).then(results => {
        Promise.all(results).then(() => {
        Place.findOneAndRemove({_id: place._id}, (err, place) => {
        if(err){
        reject(err);
        } else {
        resolve({
        message: `Successully deleted`,
        placeId: placeId
        });
        }
        });
        }).catch(e => {
        reject(e);
        });
        }).catch(e => {
        reject(e);
        }); 
        }).catch(e => {
        reject(e);
        });
        });
    }
    multiCriteriaPopulated(criteria, page, perPage, timestamp){
      return new Promise((resolve, reject) => {
      if(timestamp === 'undefined'){
        criteria = {};
      } else {
        criteria.created = { $gte: timestamp };
      
      }
      page = page ? page : 0;
      perPage = perPage ? perPage : 100;
      Place.find(criteria)
      .sort('created')
      .exec((err, places) => {
      if(err){
      reject(err);
      } else {
      let morePages = perPage < places.length;
      if(morePages){
      places.pop();
      } 
      resolve({
      records: places,
      morePages: morePages
      });
      }
      });
      });
    }
    list(criteria, page, perPage, timestamp){
      return new Promise((resolve, reject) => {
      this.multiCriteriaPopulated(criteria, page, perPage, timestamp).then(data => {
      resolve(data);
      }).catch(e => {
      reject(e);
      });
      });
    }
    delete(placeId){
      return new Promise((resolve, reject) => {
      this.findAndRemove(placeId).then(data => {
      resolve(data);
      }).catch(e => {
      reject(e);
      });
      });
    }

}

module.exports = PlaceService;