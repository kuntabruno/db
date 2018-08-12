'use strict';
const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const Schema = mongoose.Schema;
const _ = require('lodash');

/**
 * Getter
 */
const escapeProperty = (value) => {
    return _.escape(value);
  };

/**
 * A Validation function for local strategy properties
 */
const validateLocalStrategyProperty = function (property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy email
 */
const validateLocalStrategyEmail = function (email) {
  return ((this.provider !== 'local' && !this.updated) || validator.isEmail(email, { require_tld: false }));
};

const validatePresenceOf = function(value) {
  // If you are authenticating by any of the oauth strategies, don't validate.
  return (this.provider && this.provider !== 'local') || (value && value.length);
};


const UserSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
      },
      fname: {
        type: String,
        get: escapeProperty,
        required: true,
        trim: true
      },
      lname: {
         type: String,
         get: escapeProperty,
         required: true,
         trim: true
        },
      name: {
        type: String,
        get: escapeProperty,
        required: true,
      },
      number: {
          type: String
      },
      email: {
        type: String,
        required: true,
        unique: 'Email is already in use',
        lowercase: true,
        trim: true,
        default: '',
        validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
      },
      about: {
          type: String,
          get: escapeProperty          
      },
      deaf: {
         type: Boolean,
         default: false
      },
      face: {
        type: String,
        default: '/uploads/default/images/avatar.png'
      },
      background: {
        type: String,
          default: '/uploads/default/images/big.jpg'
      },
      updated: {
         type: Date
      },
      roles: {
        type: Array,
        default: ['authenticated']
      },
      provider: {
        type: String
      },
      theme: {
        type: String  
      },
      socketId: {
        type: String,
        default: ''
      },
      onlineStatus: {
        type: Boolean,
        default: false
      },
      loggedIn: {
        type: Boolean,
        default: false
      },
      hashed_password: {
        type: String,
        validate: [validatePresenceOf, 'Password cannot be blank']
      },
      provider: {
        type: String
      },
      theme: {
      type: String  
      },
      salt: {
        type: String
      },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    facebook: {},
    twitter: {},
    github: {},
    google: {},
    linkedin: {},
    activationCode: {
        type: String
    },
    active: {
        type: Boolean,
        default: false
    }
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.hashed_password = this.hashPassword(password);
  this.activationCode = Date.now().toString().substr(4, 4) + Date.now().toString().substr(6, 4) + Date.now().toString();
}).get(function() {
  return this._password;
});

/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
  if (this.isNew && this.provider === 'local' && this.password && !this.password.length)
    return next(new Error('Invalid password'));
  next();
});

/**
 * Methods
 */
UserSchema.methods = {

  /**
   * HasRole - check if the user has required role
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  hasRole: function(role) {
    var roles = this.roles;
    return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
  },

  /**
   * IsAdmin - check if the user is an administrator
   *
   * @return {Boolean}
   * @api public1
   */
  isAdmin: function() {
    return this.roles.indexOf('admin') !== -1;
  },

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.hashPassword(plainText) === this.hashed_password;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Hash password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  hashPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');
  },

  /**
   * Hide security sensitive fields
   * 
   * @returns {*|Array|Binary|Object}
   */
  toJSON: function() {
    var obj = this.toObject();
    obj.onlineStatus = obj.socketId ? true : false;
    delete obj.socketId;
    delete obj.hashed_password;
    delete obj.salt;
    delete obj.token;
    return obj;
  }
};

module.exports = mongoose.model('User', UserSchema);