const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Technician = mongoose.model('Technician');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

/* Local */
exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Login falhou!',
  successRedirect: '/',
  successFlash: 'Você está logado!',
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Desconectou!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  // check if user is auth
  if (req.isAuthenticated()) {
    next(); // carry on, he is logged in
    return;
  }

  req.flash('error', 'Não autorizado.');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // 1. See if the user exists
  const user = await Technician.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'Conta não encontrada.');
    return res.redirect('/login');
  }

  // 2. Set reset tokens and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save();
  // 3. Send the email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${
    user.resetPasswordToken
  }`;

  await mail.send({
    user,
    subject: 'Password reset',
    resetURL,
    filename: 'password-reset',
  });

  req.flash('success', `You have been emailed a password reset link.`);
  // 4. Redirect to the login page
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await Technician.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }, // if the token is not gt now, it is expired
  });

  if (!user) {
    req.flash('error', 'Token expired');
    return res.redirect('/login');
  }
  // if there is a user show the reset password form
  res.render('reset', { title: 'Reset your password!' });
};

exports.confirmedPasswords = async (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next();
    return;
  }
  req.flash('error', 'Passwords do not match!');
  res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await Technician.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }, // if the token is not gt now, it is expired
  });
  if (!user) {
    req.flash('error', 'Token expired');
    return res.redirect('/login');
  }

  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password); // set to the new password, hash it etc
  user.resetPasswordExpires = undefined;
  user.resetPasswordToken = undefined;
  const updatedUser = await user.save(); // saves the query to the db
  // login the user
  await req.login(updatedUser);
  req.flash('success', 'Password reset, you are now logged in!');
  res.redirect('/');
};
