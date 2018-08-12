'use strict';
const Redis = require('redis');

const Client = Redis.createClient();

Client.on("error", (err) => {
    console.error(`Error connectiing to Redis Server ${err}`);
});

Client.on("connect", () => {
   console.info(`dBMter service successfully connected to Redis server`); 
});

class CacheService {
  constructor(){}
  
  /**
   * Register To Cache
   * @param  {String} id
   * @param  {Obj} Object
   * @return {Promise}
   */
  setObj(id, obj){
      return new Promise((resolve, reject) => {
         Client.setex(id, 24*60*60, JSON.stringify(obj), (err, result) => {
             if(err){
                 reject(err);
             } else {
                 resolve(result);
             }
         });
      });
  }

  /**
   * Get From Cache
   * @param  {String} id
   * @return {Promise}
   */
   getObj(id){
   return new Promise((resolve, reject) => {
        Client.get(id, (err, result) => {
            if(err){
                reject(err);
            } else {
                resolve(JSON.parse(result));
            }
        });
   });  
   }

   /**
   * Delete From Cache
   * @param  {String} id
   * @return {Promise}
   */
   remove(id){
       return new Promise((resolve, reject) => {
            Client.del(id, (err, result) => {
                if(err){
                    reject(err);
                } else {
                    resolve(result);
                }
            });
       });
   }

   /**
   * Replace From Cache
   * @param  {String} id
   * @param  {Obj} obj
   * @return {Promise}
   */
  replaceObj(id, obj){
      return new Promise((resolve, reject) => {
                  this.remove(id).then((res) => {
                      this.setObj(id, obj).then((data) => {
                            resolve(data);
                      }).catch((e) => {
                          reject(e);
                      });
                  }).catch((err) => {
                      reject(err);
                  }); 
      });
  }
}
module.exports = CacheService;