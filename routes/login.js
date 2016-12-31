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


router.post('/', (req, res, next) => {
    var passwordEntered = trim(req.body.password);
    var passwordSaved = trim(process.env.PASSWORD);
    
    console.log(passwordEntered);
    console.log(passwordSaved);
    
    if (passwordEntered.toUpperCase() === passwordSaved.toUpperCase()) {
        res.status(200).send('success');
    }
    else {
        res.status(400).send('password mismatch');
    }    
});

module.exports = router;