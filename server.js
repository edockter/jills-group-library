var express = require('express');
var app = express();
var path = require('path');

app.use('/css', express.static('public/css'));
app.use('/assets', express.static('public/assets'));
app.use('/scripts', express.static('public/scripts'));

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(8080);