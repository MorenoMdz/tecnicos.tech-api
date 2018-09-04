const mongoose = require('mongoose');
const Technician = mongoose.model('Technician');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

/* Login Methods */
exports.loginForm = res => {
  res.render('login', { title: 'Entrar' });
};

exports.registerForm = res => {
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
    .checkBody('password', 'Password precisa ter no mínimo 8 caracteres')
    .matches(/^[a-zA-Z0-9]{8}$/, 'i');
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
    // Notify new user his acc is pending activation
    await mail.send({
      user,
      subject: 'Aguardando ativação',
      to: req.body.email,
      filename: 'register-success',
    });
    // Notify admin a new user was created
    const adminUrl = `http://${req.headers.host}/config`;
    await mail.send({
      user,
      subject: 'Novo usuário registrado',
      to: process.env.SITE_ADMIN,
      adminUrl,
      filename: 'check-new-user',
    });
    next();
  }
};

exports.activateUser = async (req, res, user) => {
  // Update user active_status to true
  const technician = await Technician.findOneAndUpdate(
    { _id: req.body.technician },
    { $set: { active_status: true } },
    { new: true, runValidators: true, context: 'query' }
  );

  // Notify the new user his account is active
  const accountUrl = `http://${req.headers.host}/account`;
  await mail.send({
    user,
    subject: 'Bem vindo ao Tecnicos Tech',
    to: req.body.email,
    accountUrl,
    filename: 'new-user',
  });
  req.flash('success', 'Usuário ativado com sucesso.');
  res.redirect('/config');
  /* res.json(req.body); */
};

exports.deactivateUser = async (req, res, user) => {
  const technician = await Technician.findOneAndUpdate(
    { _id: req.body.technician },
    { $set: { active_status: false } },
    { new: true, runValidators: true, context: 'query' }
  );
  req.flash('warning', 'Usuário desativado com sucesso.');
  res.redirect('/config');
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
  const techs = await Technician.find().select({
    name: 1,
    stars: 1,
    techStars: 1,
    siteRank: 1,
    active_status: 1,
  });
  res.render('techList', { title: 'Técnicos do site', techs });
};

exports.getInactiveTechList = async (req, res, next) => {
  const techs = await Technician.find().select({
    name: 1,
    stars: 1,
    techStars: 1,
    siteRank: 1,
    active_status: 1,
    email: 1,
  });
  res.locals.techs = techs;
  next();
};

exports.getTech = async (req, res) => {
  const technician = await Technician.findById({ _id: req.params.id });
  let rnGesus;
  if (technician.siteRank == 'admin') {
    let randomBoss = technician.boss;
    rnGesus = randomBoss[(Math.random() * randomBoss.length) | 0];
  }
  res.render('tech', { title: 'Tecnico', technician, rnGesus });
};
