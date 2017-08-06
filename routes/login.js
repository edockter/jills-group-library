const express = require('express');
const path = require('path');
var util = require('util');
var pg = require('pg');
pg.defaults.ssl.true;
const router = express.Router();
var bodyParser = require('body-parser');
var trim = require('trim');
var cookie_name = process.env.COOKIE_NAME;
var cookie_value = process.env.COOKIE_VALUE;

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
        console.log("Sending cookie to ");
        /* max age = 3 days in milliseconds */
        res.cookie(cookie_name , cookie_value, { maxAge: 259200000 }).status(200).send('success');
    }
    else {
        res.status(400).send('password mismatch');
    }    
});

router.post('/logout', (req, res, next) => {
    clearCookie(cookie_name);
    res.status(200).send('Cookie deleted');
});

module.exports = router;