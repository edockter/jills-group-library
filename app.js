var express = require('express');
var path = require('path');
const pg = require('pg');
const bodyParser = require('body-parser');

const routes = require('./routes/index');

var app = express();

app.use('/css', express.static('public/css'));
app.use('/assets', express.static('public/assets'));
app.use('/scripts', express.static('public/scripts'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/', routes);

app.listen(port, function() {
    console.log("App is running on ports " + port);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

module.exports = app;