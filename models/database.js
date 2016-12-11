var env = require('dotenv').config();
const pg = require('pg');
pg.defaults.ssl.true;

// Replace with YOUR connection string, or add to .env file.
var connectionString;

if (env.NODE_ENV === 'development') {
  connectionString = env.DEV_DATABASE_URL; 
}
else if (env.NODE_ENV === 'production') { 
  connectionString = env.DATABASE_URL; 
}

const client = new pg.Client(connectionString);
client.connect();
const createBooks = client.query(
  'CREATE TABLE books(bookId SERIAL PRIMARY KEY, Title VARCHAR(250) not null, CoreValue VARCHAR(100) not null, Status Varchar(50), CurrentReader VARCHAR(75))'
  );

const createAuthors = client.query(
  'CREATE TABLE authors(authorId SERIAL PRIMARY KEY, bookId SERIAL REFERENCES books(bookId), authorName VARCHAR(50))'
  );

createAuthors.on('end', () => { client.end(); });