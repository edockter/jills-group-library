var env = require('dotenv').config();
var pg = require('pg');
pg.defaults.ssl.true;

const connectionString = process.env.DATABASE_URL;
console.log(connectionString);
const client = new pg.Client(connectionString);
client.connect();

const dropAuthors = client.query(
  'DROP  TABLE authors'
  );

const dropBooks = client.query(
  'DROP TABLE books'
  );


dropAuthors.on('end', () => { client.end(); });