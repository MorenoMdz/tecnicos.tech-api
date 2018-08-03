const mongoose = require('mongoose');
const Technician = mongoose.model('Technician');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

// validation middleware
exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'Você precisa adicionar um nome!').notEmpty();
  req.checkBody('email', 'Email inválido!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody('password', 'O campo Senha não pode ser vazio!!').notEmpty();
  req
    .checkBody(
      'password-confirm',
      'O campo de confirmação não pode ser vazio!!'
    )
    .notEmpty();
  req
    .checkBody('password-confirm', 'Senhas não conferem!')
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {
      title: 'Register',
      body: req.body,
      flashes: req.flash(),
    });
    return;
  }
  next();
};

exports.registerTechnician = async (req, res, next) => {
  const user = new Technician({ email: req.body.email, name: req.body.name });
  const registerWithPromise = promisify(Technician.register, Technician);
  await registerWithPromise(user, req.body.password); // this will store a hash in the db

  next();
};

exports.account = (req, res) => {
  res.render('account', { title: 'Edit your account' });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email,
  };

  const technician = await Technician.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  req.flash('success', 'Perfil atualizado.');
  res.redirect('/login');
};