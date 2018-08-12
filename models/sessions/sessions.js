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
const escapeProperty = (value) => {
  return _.escape(value);
};

/**
 * Session Schema
 */

const SessionSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  place: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Place'
  },
  name: {
    type: String,
    required: true,
    get: escapeProperty
  },
  active: {
    type: Boolean,
    default: false
  },
  start: {
    type: Date
  },
  stop: {
    type: Date
  },
  average: {
     type: Number,
     default: 0
  },
  last: {
    type: Number,
    default: 0
  }
});

/**
 * Methods
 */
   SessionSchema.methods = {
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
  }
};

module.exports = mongoose.model('Session', SessionSchema);
