var express = require('express');
var path = require('path');
var env = require('dotenv').config();
var morgan = require('morgan');
var pg = require('pg');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var clientSessions = require('client-sessions');
var cookieParser = require('cookie-parser');

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.SECRET_KEY, { expires: new Date() + 259200000, maxAge: 259200000, httpOnly: false }));
app.use('/css', express.static('public/css'));
app.use('/assets', express.static('public/assets'));
app.use('/scripts', express.static('public/scripts'));

app.use(clientSessions({
  cookieName: process.env.COOKIE_NAME,
  secret: process.env.SECRET_KEY,
  duration: 7 * 24 * 60 * 60 * 1000,  // default to 1 week valid key
  cookie: {
    httpOnly: false,  // need to POST it with javascript
    secure: false,
    ephemeral: false
  }
}));

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

var basicRoutes = require('./routes/basic');
var apiRoutes = require('./routes/booksAPI');
var loginRoutes = require('./routes/login');

app.use('/', basicRoutes);
app.use('/api/', apiRoutes);
app.use('/login/', loginRoutes);

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

if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler({ dumpExceptions: true, showStack: true })); 
}
else if (process.env.NODE_ENV === 'production') {
  app.use(errorhandler()); 
}

module.exports = app;