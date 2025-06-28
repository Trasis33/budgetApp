const knex = require('knex');
const knexConfig = require('./knexfile');

// In a real app, you would use an environment variable here
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

const db = knex(config);

module.exports = db;
