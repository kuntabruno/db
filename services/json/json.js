'use strict';

class Jsonhelper{
    constructor(){}
    happy(obj, res, status){
        if(!status){
        status = 200;
        }
        res.status(status).send({
            success: 1,
            res: obj
        });
    };
    unhappy(err, res, status){
         if(!status){
         status = 200;
         }
         let obj = {
            success: 0,
            res: err
          };
          if (obj.res.errors) {
            obj.res.messages = [];
            for (let i in obj.res.errors) {
              obj.res.messages.push(obj.res.errors[i].message);
            }
            obj.res.message = obj.res.messages[0];
          }
          res.status(status).send(obj);
    }
}
module.exports = Jsonhelper;