'use strict';
const auth = require('./auth/auth');
const json = require('./json/json');
const User = require('./users/users');
const Place = require('./places/places');
const Session = require('./sessions/sessions');
const Decibel = require('./decibels/decibels');
module.exports = {
    auth: auth,
    json: json,
    User: User,
    Place: Place,
    Session: Session,
    Decibel: Decibel
};