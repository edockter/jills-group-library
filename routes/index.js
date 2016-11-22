const express = require('express');
const path = require('path');
var pg = require('pg');
pg.defaults.ssl.true;
const router = express.Router();

// Replace with YOUR connection string, or add to .env file.
const connectionString = process.env.DATABASE_URL; 

router.get('/', (req, res, next) => {
  res.sendFile(path.join(
    __dirname, '..', '/index.html'));
});

router.post('/api/books', (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = { 
      Title: req.body.Title, 
      CoreValue: req.body.CoreValue, 
      Status: req.body.Status, 
      CurrentReader: req.body.CurrentReader, 
      Author: req.body.Author };
  
  // Get a Postgres client from the connection pool
  pg.connect(connectionsString, (err, client, done) => {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        
        // Insert row to Books table, on success, insert into Authors
        client.query('INSERT INTO books(Title, CoreValue, Status, CurrentReader) values($1, $2, $3, $4) RETURNING bookId',
        [data.Title, data.CoreValue, data.Status, data.CurrentReader], function(err, result) {
            if (err) {
                // error
            }
            else {
                // grab returned bookId so we can put it in the Authors table as FK
                var newID = result.rows[0].bookid;

                 for (var i = 0; i < data.Author.length; i++) {
                    const authorQuery = client.query('INSERT INTO authors(AuthorName, bookId) values($1, $2)',
                    [data.Author[i], newID]);
                }                
            }
        });
                
        // SQL Query > Select Data
        const query = client.query('SELECT * FROM books INNER JOIN authors ON books.bookId =authors.bookId ORDER BY books.bookId ASC');        
        
        // Stream results back one row at a time
        query.on('row', (row) => {
          results.push(row);
        });

        // After all data is returned, close connection and return results    
        query.on('end', () => {
            done();
            console.log(results);
            return res.json(results);
        });
    });
});

router.get('/api/books', (req, res, next) => {
  const results = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // Concatenate all authors to a single string, return { id, title, authors, corevalue, status, currentreader }    
    const query = client.query("SELECT authors.bookId, array_to_string(array_agg(distinct authors.authorname),', ') AS Authors, books.title, books.corevalue, books.status, books.currentreader FROM authors JOIN books on authors.bookId = books.bookId GROUP BY authors.bookId, books.bookId");
    
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

module.exports = router;