'use strict';

/**
 * Module dependencies.
 */
const mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
          _   = require('lodash');

/**
 * Getter
 */
const escapeProperty = value => {
  return _.escape(value);
};

/**
 * Place Schema
 */

const PlaceSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: true,
    unique: true,
    get: escapeProperty
  },
  description: {
    type: String,
    required: true,
    get: escapeProperty
  },
  session: {
    type: Schema.ObjectId,
    ref: 'Session'
  },
  average: {
    type: Number,
    default: 0
  },
  last: {
    type: Number,
    default: 0
  },
  location: {
  lng: {
  type: Number
  },
  lat: {
  type: Number
  },
  address: {
  type:  String
  }
  },
  radius: {
  type: Number
  }
});

/**
 * Methods
 */
   PlaceSchema.methods = {
  /**
   * Hide security sensitive fields
   * 
   * @returns {*|Array|Binary|Object}
   */
  toJSON: function() {
    var obj = this.toObject();
    if (obj.creator) {
      delete obj.creator.token;
      delete obj.creator.hashed_password;
      delete obj.creator.salt;
    }
    return obj;
  },
  
};

module.exports = mongoose.model('Place', PlaceSchema);
