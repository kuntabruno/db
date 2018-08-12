/**
 * Main application routes
 */

'use strict';

const errors = require('./components/errors');

module.exports = (app, io) => {
  app.use('/api/v1/auth', require('./routes/auth/auth'));
  app.use('/api/v1/users', require('./routes/users/users')(io));
  app.use('/api/v1/places', require('./routes/places/places')(io));
  app.use('/api/v1/sessions', require('./routes/sessions/sessions')(io));
  app.use('/api/v1/decibels', require('./routes/decibels/decibels')(io));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth)/*')
   .get(errors[404]);
};
