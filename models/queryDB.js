const pg = require('pg');
// Replace with YOUR connection string, or add to .env file.
const connectionString = process.env.DATABASE_URL;


const client = new pg.Client(connectionObject);
client.connect();

var results = [];

var query = client.query(
    "select * FROM books JOIN authors ON books.bookId = authors.bookId"
);

query.on('row', row => {
    results.push(row);
});

query.on('end', () => { 
    client.end(); 
    console.log(results)
});