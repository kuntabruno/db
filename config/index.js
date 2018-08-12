'use strict';
module.exports = {
  baseURL: '127.0.0.1',
  db: process.env.MONGOHQ_URL || 'mongodb://' + (process.env.DB_PORT_27017_TCP_ADDR || '127.0.0.1') + '/dbMeter',
  server: {
    host: 'localhost',
    port: 9345,
  },
  themes: [
    'default', 'blue', 'pink', 'indigo', 'bluegrey', 'green',
     'teal', 'lightgreen', 'deeporange', 'red', 'brown',
  ],
  secret: 'dbmeter',
  settings: {
  perPage: 15,
  singleUserPage: 3,
  }
};
