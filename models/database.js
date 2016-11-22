const pg = require('pg');

// Replace with YOUR connection string, or add to .env file.
const connectionString = process.env.DATABASE_URL;

const client = new pg.Client(connectionObject);
client.connect();
const createBooks = client.query(
  'CREATE TABLE books(bookId SERIAL PRIMARY KEY, Title VARCHAR(250) not null, CoreValue VARCHAR(100) not null, Status Varchar(50), CurrentReader VARCHAR(75))'
  );

const createAuthors = client.query(
  'CREATE TABLE authors(authorId SERIAL PRIMARY KEY, bookId SERIAL REFERENCES books(bookId), authorName VARCHAR(50))'
  );

createAuthors.on('end', () => { client.end(); });