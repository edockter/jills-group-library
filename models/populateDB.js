var env = require('dotenv').config();
var path = require('path');
var fs = require("fs");
var request = require('request');
var querystring = require('querystring');
var http = require('http');
const pg = require('pg');
pg.defaults.ssl.true;

// Replace with YOUR connection string, or add to .env file.
const connectionString = process.env.DATABASE_URL;

var libraryFile = fs.readFileSync('strings.txt').toString().split("\n");

// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}

for (i = 0; i < libraryFile.length; i++) {
    // Configure the request
    var options = {
        url: 'http://localhost:8080/api/books?' + libraryFile[i],
        method: 'POST',
        headers: headers        
    }
    
    // POST it
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body            
        }
    }); 
    setTimeout(function() {
        console.log(options.url);
    }, 3000);   
}