const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Technician = mongoose.model('Technician');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.checkActiveStatus = async (req, res, next) => {
  const user = await Technician.findOne({
    email: req.body.email
  });
  if (user && !user.active_status) {
    req.flash(
      'warning',
      'Conta aguardando ativação. Favor contatar um administrador'
    );
    res.redirect('/login');
    return;
  }
  next();
};

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Login falhou!',
  successRedirect: '/',
  successFlash: 'Você está logado!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('warning', 'Desconectou!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash('danger', 'Não autorizado.');
  res.redirect('/login');
};

exports.isMod = (req, res, next) => {
  if (req.user.siteRank == 'admin') {
    next();
    return;
  }
  req.flash('danger', 'Somente moderadores.');
  res.redirect('/');
};

exports.isActive = (req, res, next) => {
  if (req.user.active_status === true) {
    next();
    return;
  }
  req.flash('danger', 'Conta inativa, por favor contatar os administradores');
  res.redirect('/');
};

exports.forgot = async (req, res) => {
  // 1. See if the user exists
  const user = await Technician.findOne({ email: req.body.email });
  if (!user) {
    req.flash('danger', 'Conta não encontrada.');
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
    subject: 'Reset de senha',
    to: req.body.email,
    resetURL,
    filename: 'password-reset'
  });

  req.flash('success', `Um email para reconfigurar seu acesso foi enviado.`);

  // 4. Redirect to the login page
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await Technician.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } // if the token is not 'gt now', it is expired
  });

  if (!user) {
    req.flash('danger', 'Token expirado, tente novamente.');
    return res.redirect('/login');
  }
  // if there is a user show the reset password form
  res.render('reset', { title: 'Reconfigure a sua senha.' });
};

exports.confirmedPasswords = async (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next();
    return;
  }
  req.flash('danger', 'Senhas não batem');
  res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await Technician.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('danger', 'Token expirado.');
    return res.redirect('/login');
  }

  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password); // set to the new password, hash it etc
  user.resetPasswordExpires = undefined;
  user.resetPasswordToken = undefined;
  const updatedUser = await user.save(); // saves the query to the db
  // login the user
  //await req.login(updatedUser);
  req.flash(
    'success',
    'Senha reconfigurada, por favor entre com a senha nova.'
  );
  res.redirect('/login');
};
