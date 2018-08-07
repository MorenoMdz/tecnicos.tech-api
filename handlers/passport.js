const passport = require('passport');
const mongoose = require('mongoose');
const Tech = mongoose.model('Technician');
const User = mongoose.model('users');

/* passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user));
  //console.log(id);
}); */
passport.use(Tech.createStrategy());
passport.serializeUser(Tech.serializeUser());
passport.deserializeUser(Tech.deserializeUser());
