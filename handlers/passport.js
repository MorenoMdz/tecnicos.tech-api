const passport = require('passport');
const mongoose = require('mongoose');
const Tech = mongoose.model('Technician');

passport.use(Tech.createStrategy());
passport.serializeUser(Tech.serializeUser());
passport.deserializeUser(Tech.deserializeUser());
