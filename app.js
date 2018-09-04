const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const promisify = require('es6-promisify');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const routes = require('./routes/index');
const helpers = require('./helpers/helper');
const errorHandlers = require('./handlers/errorHandlers');
require('./handlers/passport');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Exposes a bunch of methods for validating data.
app.use(expressValidator());

// populates req.cookies with any cookies that came along with the request
app.use(cookieParser());

// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 3600000 * 24 * 7 },
  })
);

// // Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

// // The flash middleware
app.use(flash());

// pass variables to our templates + all requests via locals
app.use((req, res, next) => {
  res.locals.posts = req.body.posts || null;
  res.locals.homeDisplay = req.body.homeDisplay || null;
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null; // passport passes user to our locals
  res.locals.technician = req.technician || null; // passport passes user to our locals
  res.locals.currentPath = req.path;
  next();
});

// promisify some callback based APIs
app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});

/* Routes */
app.use('/', routes);

/* Handle notFound error */
app.use(errorHandlers.notFound);

/* Handle error flash msgs */
app.use(errorHandlers.flashValidationErrors);

/* Display error stack when in Dev build */
if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

/* production error handler */
app.use(errorHandlers.productionErrors);

/* exports the app starting module to start the app */
module.exports = app;
