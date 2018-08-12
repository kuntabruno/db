'use strict';
const auth = require('./auth/auth');
const user = require('./users/users');
const place = require('./places/places');
const session = require('./sessions/sessions');
const decibel = require('./decibels/decibels');
module.exports = io =>  {
    return {
    auth: auth,
    user: user(io),
    place: place(io),
    session: session(io),
    decibel: decibel(io)
    };
};