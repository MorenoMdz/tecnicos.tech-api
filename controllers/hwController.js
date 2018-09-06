const mongoose = require('mongoose');
const Hardware = mongoose.model('Hardware');

/* Hardware Management Methods */
exports.addNewHw = async (req, res) => {
  req.body.author = req.user._id;
  req.body.photos = req.files;

  const hardware = await new Hardware(req.body)
    .save()
    .catch(err => console.log(err));

  req.flash('success', `Adicionado ${req.body.name} com sucesso.`);
  res.redirect('/config');
};

async function hwList(req, res, next) {
  const hardwares = await Hardware.find();
  return hardwares;
}

exports.hardwares = hwList();

exports.getAllHw = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 25;
  const skip = page * limit - limit;

  const hwPromise = Hardware.find()
    .skip(skip)
    .limit(limit);
  const countPromise = Hardware.count();

  const [hardwares, count] = await Promise.all([hwPromise, countPromise]);
  const pages = Math.ceil(count / limit);
  if (!hardwares.length && skip) {
    req.flash(
      'info',
      `You asked for page ${page} that does not exists. Redirecting to the page ${pages}!`
    );
    return;
  }
  res.render('hardwareList', {
    title: 'Hardware Config',
    hardwares: hardwares,
    area: 'hardwares',
    page,
    pages,
    count
  });
};

exports.getHwList = async (req, res, next) => {
  const page = req.params.page || 1;
  const limit = 15;
  const skip = page * limit - limit;
  // query db for a list of all repairs
  const hwPromise = Hardware.find()
    .skip(skip)
    .limit(limit);
  const countPromise = Hardware.count();
  // will await until both promises return
  const [hardwares, count] = await Promise.all([hwPromise, countPromise]);
  const pages = Math.ceil(count / limit); // rounded
  if (!hardwares.length && skip) {
    req.flash(
      'info',
      `You asked for page ${page} that does not exists. Redirecting to the page ${pages}!`
    );
    return;
  }
  res.locals.hwList = {
    hardwares,
    page,
    pages,
    count
  };
  next();
};

exports.getHwBySlug = async (req, res) => {
  const hardwares = await hwList();
  const hardware = await Hardware.findOne({
    slug: req.params.slug
  }).populate('author problems');
  if (!hardware) return next(); // it kicks in the 404 error handler
  res.render('hardware', {
    hardware: hardware,
    hardwares: hardwares,
    title: hardware.name
  });
};

exports.getHwById = async id => {
  const hardware = await Hardware.findOne({
    _id: id
  });

  return hardware;
};

exports.updateHw = async (req, res) => {
  req.body.photos = req.files;

  const updates = {
    name: req.body.name,
    model: req.body.model,
    brand: req.body.brand,
    description: req.body.description,
    photos: req.body.photos
  };

  const hw = await Hardware.findOneAndUpdate(
    { _id: req.body.id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  req.flash('success', 'Hardware atualizado.');
  res.redirect('back');
};

exports.searchHw = async (req, res) => {
  const hardwares = await Hardware.find(
    {
      $text: {
        $search: req.query.q
      }
    },
    {
      score: { $meta: 'textScore' }
    }
  )
    .sort({
      score: { $meta: 'textScore' }
    })
    .limit(5);
  problems = res.locals.problems;
  res.json({ hardwares, problems });
};
