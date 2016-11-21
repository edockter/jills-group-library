var express = require('express');
var app = express();
var path = require('path');

app.use('/css', express.static('public/css'));
app.use('/assets', express.static('public/assets'));
app.use('/scripts', express.static('public/scripts'));

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, function() {
    console.log("App is running on port " + port);
});