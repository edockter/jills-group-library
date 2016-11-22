const pg = require('pg');
const connectionString = process.env.DATABASE_URL;

const client = new pg.Client(connectionString);
client.connect();

const dropAuthors = client.query(
  'DROP  TABLE authors'
  );

const dropBooks = client.query(
  'DROP TABLE books'
  );


dropAuthors.on('end', () => { client.end(); });