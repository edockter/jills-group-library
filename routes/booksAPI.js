const express = require('express');
const path = require('path');
var util = require('util');
var pg = require('pg');
pg.defaults.ssl.true;
const router = express.Router();
var bodyParser = require('body-parser');
var trim = require('trim');

// Replace with YOUR connection strings, or add to .env file.
var connectionString;
if (process.env.NODE_ENV === 'development') {
  connectionString = process.env.DEV_DATABASE_URL; 
}
else if (process.env.NODE_ENV === 'production') { 
  connectionString = process.env.DATABASE_URL; 
} 

router.get('/books/:bookid', (req, res, next) => {
    const results = [];
    const bookid = req.params.bookid;

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
    // Concatenate all authors to a single string, return { id, title, authors, corevalue, status, currentreader }    
    const query = client.query("SELECT authors.bookId, array_to_string(array_agg(distinct authors.authorname),', ') AS Authors, books.title, books.corevalue, books.status, books.currentreader FROM authors JOIN books on authors.bookId = books.bookId  WHERE books.bookid = ($1) GROUP BY authors.bookId, books.bookId ORDER BY books.Title", [bookid]);
    
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

router.get('/books', (req, res, next) => {
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
    const query = client.query("SELECT authors.bookId, array_to_string(array_agg(distinct authors.authorname),', ') AS Authors, books.title, books.corevalue, books.status, books.currentreader FROM authors JOIN books on authors.bookId = books.bookId GROUP BY authors.bookId, books.bookId ORDER BY books.Title");
    
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

router.post('/books', (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = { 
      Title: trim(req.body.title), 
      CoreValue: trim(req.body.corevalue), 
      Status: trim(req.body.status),
      CurrentReader: trim(req.body.currentreader), 
      Author: trim(req.body.author) };
  
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
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
                done();
                console.log(err);
                return res.status(500).json({success: false, data: err});
            }
            else {
                // grab returned bookId so we can put it in the Authors table as FK
                var newID = result.rows[0].bookid;                
                var authorData = data.Author;

                // if we have multiple authors, create a row for each one
                if (util.isArray(authorData)) {
                    for (var i = 0; i < authorData.length; i++) {
                        const authorQuery = client.query('INSERT INTO authors(AuthorName, bookId) values($1, $2)',
                        [authorData[i], newID], function(err, result) {
                            if (err) {
                                // error
                                done();
                                console.log(err);
                                return res.status(500).json({success: false, data: err});
                            }
                        });
                    }
                }

                // if we have 1 author, create 1 row
                else {
                    const authorQuery = client.query('INSERT INTO authors(AuthorName, bookId) values($1, $2)',
                        [authorData, newID], function(err, result) {
                            if (err) {
                                // error
                                done();
                                console.log(err);
                                return res.status(500).json({success: false, data: err});
                            }
                        });
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
            return res.json(results);
        });
    });
});



router.put('/books/:bookid', (req, res, next) => {    
    const results = [];
    const bookid = req.params.bookid;
    // Grab data from http request    
    const data = {
        title: trim(req.body.title),
        corevalue: trim(req.body.corevalue),
        status: trim(req.body.status),
        currentreader: trim(req.body.currentreader),
        Author: trim(req.body.author) 
    };
      
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        console.log(req.body);
        // update row in Books table, on success, update Authors
        client.query('UPDATE books SET title=($1), corevalue=($2), status=($3), currentreader=($4) WHERE bookid=($5)',
        [data.title, data.corevalue, data.status, data.currentreader, bookid], function(err, result) {
            if (err) {
                // error
                done();
                console.log(err);
                return res.status(500).json({success: false, data: err});
            }
            else {
                var authorData = data.Author;

                // if we have multiple authors, drop all and add again                
                if (util.isArray(authorData)) {
                    const bookQuery = client.query('DELETE FROM authors WHERE bookid=($1)',
                     [bookid], function(err, result) {
                            if (err) {
                                // error
                                done();
                                console.log(err);
                                return res.status(500).json({success: false, data: err});
                            }
                            else {
                                for (var i = 0; i < authorData.length; i++) {
                                    const authorQuery = client.query('INSERT INTO authors(AuthorName, bookId) values($1, $2)',
                                    [authorData[i], bookid], function(err, result) {
                                        if (err) {
                                            // error
                                            done();
                                            console.log(err);
                                            return res.status(500).json({success: false, data: err});
                                        }
                                    });
                                }
                            }
                    });                    
                }

                // if we have 1 author, update the 1 row
                else {
                    const authorQuery = client.query('UPDATE authors SET authorname=($1) WHERE bookid=($2)',
                        [authorData, bookid], function(err, result) {
                            if (err) {
                                // error
                                done();
                                console.log(err);
                                return res.status(500).json({success: false, data: err});
                            }
                        });
                }
            }
        });    

        // SQL Query > Update Data > Concatenate all authors to a single string, return { id, title, authors, corevalue, status, currentreader }    
        const query = client.query("SELECT authors.bookId, array_to_string(array_agg(distinct authors.authorname),', ') AS Authors, books.title, books.corevalue, books.status, books.currentreader FROM authors JOIN books on authors.bookId = books.bookId GROUP BY authors.bookId, books.bookId ORDER BY books.Title");    
        // Stream results back one row at a time
            query.on('row', (row) => {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });
});

router.delete('/books/:bookid', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const bookid = req.params.bookid;
  // Grab data from http request
  const data = {text: req.body.text, complete: req.body.complete};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Update Data
        const authorDeleteQuery = client.query('DELETE FROM authors WHERE bookid=($1)',
        [bookid], function(err, result) {
            if (err) {
                // error
                done();
                console.log(err);
                return res.status(500).json({success: false, data: err});
            }
            else {                
                const bookDeleteQuery = client.query('DELETE FROM books WHERE bookid=($1)',
                [bookid], function(err, result) {
                    if (err) {
                        // error
                        done();
                        console.log(err);
                        return res.status(500).json({success: false, data: err});
                    }
                });
            }
        });    
    
        // SQL Query > Update Data > Concatenate all authors to a single string, return { id, title, authors, corevalue, status, currentreader }    
        const query = client.query("SELECT authors.bookId, array_to_string(array_agg(distinct authors.authorname),', ') AS Authors, books.title, books.corevalue, books.status, books.currentreader FROM authors JOIN books on authors.bookId = books.bookId GROUP BY authors.bookId, books.bookId ORDER BY books.Title");    
        // Stream results back one row at a time
        query.on('row', (row) => {
        results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
        done();
        return res.json(results);
        });
  });
});

router.get('/authors/', (req, res, next) => {
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
    const query = client.query("SELECT DISTINCT AuthorName AS Author FROM authors ORDER BY AuthorName");
    
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

router.get('/authors/:bookid', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const bookid = req.params.bookid;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // Concatenate all authors to a single string, return { id, title, authors, corevalue, status, currentreader }    
    const query = client.query("SELECT DISTINCT AuthorName AS Author FROM authors WHERE bookId = ($1) ORDER BY AuthorName", [bookid]);
    
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