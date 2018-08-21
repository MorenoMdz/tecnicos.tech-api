const mongoose = require('mongoose');
const Technician = mongoose.model('Technician');
const promisify = require('es6-promisify');

/* Login Methods */
exports.loginForm = (req, res) => {
  res.render('login', { title: 'Entrar' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Registrar' });
};

/* Validation Middleware */
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
    req.flash('danger', errors.map(err => err.msg));
    res.render('register', {
      title: 'Registrar',
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
  let emailExists = '';
  await registerWithPromise(user, req.body.password) // this will store a hash of the password in the db
    .catch(e => {
      return (emailExists = e.name);
    });
  if (emailExists == 'UserExistsError') {
    req.flash('danger', 'Um usuário já existe com esse email.');
    res.render('register', {
      title: 'Registrar',
      body: req.body,
      flashes: req.flash(),
    });
    emailExists = '';
    return;
  } else {
    next();
  }
};

exports.account = (req, res) => {
  res.render('account', { title: 'Editar sua conta' });
};

exports.updateAccount = async (req, res) => {
  let showContactInfo = false;
  if (req.body.contacts_public == 'on') {
    showContactInfo = true;
  } else {
    showContactInfo = false;
  }

  let showAddress = false;
  if (req.body.showAddress == 'on') {
    showAddress = true;
  } else {
    showAddress = false;
  }

  const updates = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    'address.street': req.body.street,
    'address.number': req.body.number,
    'address.complemento': req.body.complemento,
    'address.bairro': req.body.bairro,
    'address.city': req.body.city,
    'address.state': req.body.state,
    'address.zipCode': req.body.zipCode,
    'address.store_name': req.body.store_name,
    'address.site_name': req.body.site_name,
    'address.public': showAddress,
    contacts_public: showContactInfo,
  };

  const technician = await Technician.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  req.flash('success', 'Perfil atualizado.');
  res.redirect(`/tech/${req.user._id}`);
};

exports.getTechList = async (req, res) => {
  const technics = await Technician.find().select({
    name: 1,
    stars: 1,
    techStars: 1,
  });
  res.render('techList', { title: 'Técnicos do site', technics });
};

exports.getTech = async (req, res) => {
  const technician = await Technician.findById({ _id: req.params.id });
  res.render('tech', { title: 'Tecnico', technician });
};
