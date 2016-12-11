var env = require('dotenv').config();
const pg = require('pg');
pg.defaults.ssl.true;

// Replace with YOUR connection string, or add to .env file.
const connectionString = process.env.DATABASE_URL;

const client = new pg.Client(connectionString);
client.connect();

var results = [];

var query = client.query(
    //"select * FROM books JOIN authors ON books.bookId = authors.bookId"
    "select * FROM authors ORDER BY bookId"
);

query.on('row', row => {
    results.push(row);
});

query.on('end', () => { 
    client.end(); 
    console.log(results)
});