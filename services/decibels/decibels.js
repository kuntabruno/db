'use strict';
const Decibel = require('../../models/index').Decibels;
  class DecibelsService {
    constructor(){}
    create(data){
      return new Promise((resolve, reject) => {
      if(data.place && data.session){
      let decibel = new Decibel(data);
      decibel.save((err, decibel) => {
      if(err){
      reject(err);
      } else {
      resolve({
      record: decibel,
      message: `Successfully created decibel`
      });
      }
      });
      } else {
      reject({message: `Missing proper idents`})
      }
      });
    }
    singlePopulated(decibelId){
      return new Promise((resolve, reject) => {
      Decibel.findOne({_id: decibelId})
      .populate('place')
      .exec((err, decibel) => {
      if(err){
      reject(err);
      } else if(decibel){
      resolve(decibel);
      } else {
      reject({message: `Decibel not found`});
      }
      });
      });
    }
    singleUnpopulated(decibelId){
      return new Promise((resolve, reject) => {
      Decibel.findOne({_id: decibelId})
      .exec((err, decibel) => {
      if(err){
      reject(err);
      } else if(decibel){
      resolve(decibel);
      } else {
      reject({message: `Decibel not found`});
      }
      });
      });
    }
    singleCriteriaPopulated(criteria){
      return new Promise((resolve, reject) => {
      Decibel.findOne(criteria)
      .populate('place')
      .exec((err, decibel) => {
      if(err){
      reject(err);
      } else if(decibel){
      resolve(decibel);
      } else {
      reject({message: `Decibel not found`});
      }
      });
      });
    }
    singleCriteriaUnpopulated(criteria){
      return new Promise((resolve, reject) => {
      Decibel.findOne(criteria)
      .exec((err, decibel) => {
      if(err){
      reject(err);
      } else if(decibel){
      resolve(decibel);
      } else {
      resolve(null);
      }
      });
      });
    }
    findAndRemove(decibelId){
      return new Promise((resolve, reject) => {
      this.singleUnpopulated(decibelId).then(decibel => {
      Decibel.findOneAndRemove({_id: decibelId}, (err, decibel) => {
      if(err){
      reject(err);
      } else {
      resolve({
      message: `Successully deleted decibel`,
      decibelId: decibelId
      });
      }
      });
      }).catch(e => {
      reject(e);
      });
      });
    }
    removeAlreadyConfirmedFind(decibelId){
      return new Promise((resolve, reject) => {
      Decibel.findOneAndRemove({_id: decibel._id}, (err, decibel) => {
      if(err){
      reject(err);
      } else {
      resolve({
      message: `Successully deleted decibel`,
      decibelId: decibelId
      });
      }
      });
      });
    }
    delete(decibelId){
      return new Promise((resolve, reject) => {
      this.findAndRemove(decibelId).then(data => {
      resolve(data);
      }).catch(e => {
      reject(e);
      });
      });
    }
    multiCriteriaPopulated(criteria, page, perPage){
       return new Promise((resolve, reject) => {
        const SessionSvc = require('../index').Session;
        const sessionSvc = new SessionSvc();
        criteria = criteria ? criteria : {};
        page = page ? page : 0;
        perPage = perPage ? perPage : 10;
        Decibel.find(criteria)
       .populate('place')
       .populate('session')
       .sort('-created')
       .skip(parseInt(page) * perPage)
       .limit(perPage+1)
       .exec((err, decibels) => {
        if(err){
        reject(err);
        } else {
       let morePages = perPage < decibels.length;
       if(morePages){
       decibels.pop();
       } 
       DecibelsService.getLastAndAverageValues(decibels).then(data => {
       if(criteria && criteria.session){
       sessionSvc.updateAverageAndLastValue(criteria.session, data).then(data => {
      console.log('done');
      }).catch(e => {
      console.log(e);
      });
      }
       resolve({
       records: decibels,
       morePages: morePages,
       averageValue: data.average,
       lastValue: data.last
       });
       }).catch(e => {
       reject({message: `An error occurred while determining last and average values`});
       });
       }
       });
      
       });
      }
      multiCriteriaUnpopulatedWithoutSkip(criteria){
        return new Promise((resolve, reject) => {
        criteria = criteria ? criteria : {};
        Decibel.find(criteria)
        .exec((err, decibels) => {
        if(err){
        reject(err);
        } else {
        resolve({
        records: decibels,
        });
        }
        });
        });
      }
    getSessionDecibels(sessionId, page, perPage){ 
      return new Promise((resolve, reject) => {
      this.multiCriteriaPopulated({session: sessionId}, page, perPage).then(data => {
      resolve(data);
      }).catch(e => {
      reject(e);
      });
      });
    }
    removeSessionDecibels(sessionId){
      return new Promise((resolve, reject) => {
      this.multiCriteriaUnpopulatedWithoutSkip({session: sessionId}).then(data => {
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
    static getLastAndAverageValues(arr){
       return new Promise((resolve, reject) => {
       let avg = 0;
       let lst = 0;
       let divider = 1;
       for (let i = 0; i < arr.length; i++) {
       if(arr[i].value > 0){
       avg = Math.round(arr[i].value + avg/divider)
       divider++;
       }
       }
       resolve({
       average: avg,
       last: Math.round(arr[0].value)
       });
       });
    }
    }
    module.exports = DecibelsService;