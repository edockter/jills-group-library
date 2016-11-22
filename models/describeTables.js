var env = require('dotenv').config();
const pg = require('pg');
pg.defaults.ssl.true;

// Replace with YOUR connection string, or add to .env file.
const connectionString = process.env.DATABASE_URL;

const client = new pg.Client(connectionString);
client.connect();

var results = [];

var queryBooks = client.query(
    "select column_name, data_type, character_maximum_length from INFORMATION_SCHEMA.COLUMNS where table_name = 'books'"
);

queryBooks.on('row', row => {
    results.push(row);
});

console.log(results);
var queryAuthors = client.query(
    "select column_name, data_type, character_maximum_length from INFORMATION_SCHEMA.COLUMNS where table_name = 'authors'"
);

queryAuthors.on('row', row => {
    results.push(row);
});

queryAuthors.on('end', () => { 
    client.end(); 
    console.log(results)
});