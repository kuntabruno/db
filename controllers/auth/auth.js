const UserSvc = require('../../services/index').User;
const JsonSvc = require('../../services/index').json;
const userSvc = new UserSvc();
const json = new JsonSvc();

class AuthController{
    constructor(){}
    login(req, res){
      userSvc.authenticate(req.body).then(data => {
      return json.happy(data, res);
      }).catch(e => {
      return json.unhappy(e, res);
      });
    }

    register(req, res){
      userSvc.create(req.body).then(data => {
      return json.happy(data, res);
      }).catch(e => {
      return json.unhappy(e, res);
      });
    }

    me(req, res){
     userSvc.me(req.user).then(data => {
     return json.happy(data, res);
     }).catch(e => {
     return json.unhappy(e, res);
     });
    }
}
module.exports = AuthController;