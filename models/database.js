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
  'CREATE TABLE books(bookId SERIAL PRIMARY KEY, Title VARCHAR(250) NOT NULL, CoreValue VARCHAR(100) NOT NULL, Status Varchar(50), CurrentReader VARCHAR(75), Description VARCHAR(MAX), '
  );

const createAuthors = client.query(
  'CREATE TABLE authors(authorId SERIAL PRIMARY KEY, bookId SERIAL REFERENCES books(bookId), authorName VARCHAR(50)) NOT NULL'
  );

const createCopies = client.query(
  'CREATE TABLE copies(copyId SERIAL PRIMARY KEY, bookId SERIAL REFERENCES books(bookId) NOT NULL)'
  );

  const createCheckouts = client.query(
  'CREATE TABLE checkouts(checkoutId SERIAL PRIMARY KEY, copyId SERIAL REFERENCES copies(copyId) not null, active BOOLEAN NOT NULL DEFAULT true)'
  );
createAuthors.on('end', () => { client.end(); });