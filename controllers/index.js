'use strict';

const auth = require('./auth/auth');
const users = require('./users/users');
const places = require('./places/places');
const sessions = require('./sessions/sessions');
const decibels = require('./decibels/decibels');
module.exports = {
    auth: auth,
    users: users,
    places: places,
    sessions: sessions,
    decibels: decibels
};