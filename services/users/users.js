'use strict';
const User = require('../../models/index').Users,
      Config = require('../../config/index'),
      jwt = require('jsonwebtoken'),
      _ = require('lodash');


class UserService {
    constructor(){
    this.secret = Config.secret;
    }
    create(data){
        return new Promise((resolve, reject) => {
        if(data.email && data.fname && data.lname){
        data.roles = ['authenticated'];
        data.active = true;
        data.provider = 'local';
        data.token = jwt.sign(data, this.secret);
        this.singleCriteria({email: data.email}).then(user => {
        if(user){
        reject({message: `Email is already in use`});
        } else {
        this.countUsers().then(count => {
        if(!count){
        data.roles = data.roles.concat('admin');
        let user = new User(data);
        user.name = `${data.fname} ${data.lname}`;
        user.save((err, user) => {
        if(err){
        reject(err);
        } else {
        resolve({
        message: `Registration Successful`,
        record: user,
        token: user.token
        });
        }
        })
        } else {
        let user = new User(data);
        user.name = `${data.fname} ${data.lname}`;
        user.save((err, user) => {
        if(err){
        reject(err);
        } else {
        resolve({
        message: `Registration Successful`,
        record: user,
        token: user.token
        });
        }
        });
        }
        }).catch(e => {
        reject(e);
        }); 
        }
        }).catch(e => {
        reject(e); 
        })
        } else {
        reject({message: `Email is required`});
        }
        });
    }
    modify(user, data){
        return new Promise((resolve, reject) => {
        let fname = data.fname;
        let lname = data.lname;
        let deaf = data.deaf;
        if(user){
        user.fname = fname || user.fname;
        user.lname = lname || user.lname;
        user.name = `${fname} ${lname}`|| user.name;
        user.deaf = deaf || user.deaf;
        user.save((err, user) => {
        if(err){
        reject(err);
        } else {
        resolve({
        message: `Successfully updated user details`,
        record: user
        });
        }
        });
        } else {
        reject({message: `Not Authenticated`});
        }
        });
        }
        delete(userId){
        return new Promise((resolve, reject) => {
        if(userId){
        User.findOneAndRemove({_id: userId}, err => {
        if(err){
        reject(err);
        } else {
        resolve({
        message: `User Successfully Removed`,
        userId: userId
        });
        }
        });
        } else {
        reject({
        message: `Missing required ident`
        });
        }
        });
    }
    deleteAll(){
      return new Promise((resolve, reject) => {
      let users = result.records;
      User.deleteMany({}, err => {
      if(err){
      reject(err);
      } else {
      resolve({message: `Success`});
      }
      }); 
      });
    }
    list(page, perPage){
        return new Promise((resolve, reject) => {
        page = parseInt(page) || 0;
        perPage = parseInt(perPage) || 1000;
        User.find()
        .skip(page * perPage)
        .limit(perPage+1)
        .exec((err, users) => {
        if(err){
        reject(err);
        } else {
        let morePages = UserService.morePages(users, perPage);
        if(morePages){
        user.pop();
        } else {
        resolve({
        records: users
        });
        }
        }
        });
        });
    }
    me(user){
        return new Promise((resolve, reject) => {
        if(user){
        resolve({
        record: user,
        token: user.token
        });
        } else {
        reject(`Not Authenticated`);
        }
        });
    }
    countUsers(){
        return new Promise((resolve, reject) => {
        User.count({}, (err, count) => {
        if(err){
        reject(err);
        } else {
        resolve(count);
        }
        });
        });
    }
    singleCriteria(criteria){
        return new Promise((resolve, reject) => {
        User.findOne(criteria)
        .exec((err, user) => {
        if(err){
        reject(err);
        } else if(user){
        resolve(user);
        } else {
        resolve(null)
        }
        });
        });
    }
    authenticate(data){
        return new Promise((resolve, reject) => {
        if(data.email && data.password){
        this.singleCriteria({email: data.email}).then(user => {
        if(user){
        let val = user.hashed_password;
        let val2 = user.hashPassword(data.password);
        if(val === val2){
        resolve({
        record: user,
        token: user.token,
        message: `Authenticated`
        });
        } else {
        reject({message: `Incorrect Number/Password`});
        }
        } else {
        reject({message: `Unknown Email`});
        }
        }).catch(e => {
        reject(e);
        });
        } else {
        reject({message: `Please enter both email and password`});
        }
        });
    }
    search(keyword, userId){
        return new Promise((resolve, reject) => {
        if(keyword){
        keyword = new RegExp(keyword, 'ig');
        let criteria = {};
        if(userId){
        criteria = {
        $or: [
        { name: keyword },
        { number: keyword }
        ],
        _id: {$ne: userId}
        };
        } else {
        criteria = {
        $or: [
        { name: keyword },
        { number: keyword }
        ],
        }  
        }
        User.find(criteria)
        .sort('name')
        .exec((err, users) => {
        if(err){
        reject(err);
        } else {
        resolve({
        items: users
        });
        }
        });
        } else {
        reject({
        message: `Missing required ident`
        });
        } 
        });
      }
    static morePages(arr, perPage){
        return morePages = perPage < arr.length;
    }
}

module.exports = UserService;