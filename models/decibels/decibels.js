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
 * Decibel Schema
 */

const DecibelSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  place: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Place'
  },
  session:  {
    type: Schema.ObjectId,
    ref: 'Session'
  },
  value: {
    type: Number,
    required: true
  }
});

/**
 * Methods
 */
   DecibelSchema.methods = {
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

module.exports = mongoose.model('Decibel', DecibelSchema);
